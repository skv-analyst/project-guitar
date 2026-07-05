/*
 * Экран "Гриф" — объединяет то, что раньше было двумя отдельными экранами
 * (CAGED и Боксы), в один, с переключателем EDCAG/BOX, общей строкой
 * тональностей и dur/moll — перенесено из fretflow-fretboard-screen.html.
 *
 * Транспонизация (shapeAnchor/getShapeNotes для EDCAG, boxAnchor для боксов)
 * — уже рабочие, провалидированные формулы из референса, перенесены как есть.
 * Диатонические аккорды/ступени считает js/theory.js (та же формула, что и
 * раньше, покрыта tests/theory.test.js) — в референсе она была продублирована
 * инлайн, здесь просто переиспользуем существующий модуль.
 */
(function () {
  "use strict";

  var KEYS = ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"];

  var keyRowEl = document.getElementById("keyRow");
  var shapeFilterEl = document.getElementById("shapeFilter");
  var legendEl = document.getElementById("legend");
  var fretboardSvg = document.getElementById("fretboardSvg");
  var degreeMiniRowEl = document.getElementById("degreeMiniRow");
  var group3CagedEl = document.getElementById("group3Caged");
  var group3BoxesEl = document.getElementById("group3Boxes");
  var progressionFilterEl = document.getElementById("progressionFilter");
  var sequenceGridEl = document.getElementById("sequenceGrid");
  var seqToggleEl = document.getElementById("seqToggle");
  var seqToggleLabelEl = document.getElementById("seqToggleLabel");
  var seqTogglePreviewEl = document.getElementById("seqTogglePreview");
  var seqPanelEl = document.getElementById("seqPanel");

  var state = { key: "E", view: "caged", mode: "dur", selected: "all" };
  var progressionSelected = null;

  function keySemitone(name) {
    return Theory.SHARP_NAMES.indexOf(name);
  }

  function shapeAnchor(shapeName, targetSemitone) {
    return ((targetSemitone - CagedData.nativeRootSemitone[shapeName]) % 12 + 12) % 12;
  }

  // В миноре терция (degree '3') опускается на полтона, корень и квинта не трогаются.
  function getShapeNotes(shapeName, mode) {
    return CagedData.shapes[shapeName].map(function (n) {
      if (mode === "moll" && n.degree === "3") {
        return { string: n.string, fret: n.fret - 1, degree: "b3" };
      }
      return n;
    });
  }

  function boxAnchor(boxIndex, targetSemitone) {
    var box = BoxesData.boxes[boxIndex];
    return ((box.nativeAnchorE + (targetSemitone - 4) % 12 + 12) % 12);
  }

  function isVisible(key) {
    return state.selected === "all" || state.selected.has(key);
  }

  function toggleSelection(key) {
    if (state.selected === "all") {
      state.selected = new Set([key]);
    } else {
      if (state.selected.has(key)) state.selected.delete(key);
      else state.selected.add(key);
      if (state.selected.size === 0) state.selected = "all";
    }
  }

  function cagedNoteColor(degree) {
    if (degree === "1") return "#C1633E";
    if (degree === "3" || degree === "b3") return "#B98B3E";
    return "#6B8A6E";
  }

  function boxNoteColor(degree) {
    if (degree === "1") return "#C1633E";
    if (degree === "6") return "#8B5A6B";
    return "#C7C0AF";
  }
  function boxTextColor(degree) {
    return degree === "1" || degree === "6" ? "#fff" : "#5A5648";
  }

  function buildGroups() {
    var targetSemitone = keySemitone(state.key);
    var groups = [];

    if (state.view === "caged") {
      CagedData.order.forEach(function (name) {
        if (!isVisible(name)) return;
        var shift = shapeAnchor(name, targetSemitone);
        var notes = getShapeNotes(name, state.mode)
          .filter(function (n) { return n.fret + shift >= 0; })
          .map(function (n) {
            var label = n.degree === "1" ? "R" : n.degree;
            return { string: n.string, fret: n.fret + shift, color: cagedNoteColor(n.degree), label: label, radius: 15, textColor: "#fff" };
          });
        groups.push({ label: name, color: CagedData.color[name], notes: notes });
      });
    } else {
      BoxesData.boxes.forEach(function (box, b) {
        if (!isVisible(b)) return;
        var anchor = boxAnchor(b, targetSemitone);
        var notes = [];
        Object.keys(box.degrees).forEach(function (stringNum) {
          box.degrees[stringNum].forEach(function (entry) {
            var label = entry.degree === "1" ? "R" : entry.degree === "6" ? "r" : "";
            var radius = entry.degree === "1" || entry.degree === "6" ? 15 : 11;
            notes.push({
              string: Number(stringNum), fret: anchor + entry.fret,
              color: boxNoteColor(entry.degree), label: label, radius: radius, textColor: boxTextColor(entry.degree)
            });
          });
        });
        groups.push({ label: String(box.id), color: box.color, notes: notes });
      });
    }

    return groups;
  }

  function renderFretboard() {
    Fretboard.renderNeck(fretboardSvg, { groups: buildGroups() });
  }

  function renderKeys() {
    keyRowEl.innerHTML = "";
    KEYS.forEach(function (k) {
      var btn = document.createElement("button");
      btn.className = "key-btn" + (k === state.key ? " active" : "");
      btn.textContent = k;
      btn.addEventListener("click", function () {
        state.key = k;
        renderKeys();
        renderShapeFilter();
        renderFretboard();
        renderDegreeMiniRow();
        renderSequenceRow();
      });
      keyRowEl.appendChild(btn);
    });
  }

  function renderShapeFilter() {
    shapeFilterEl.innerHTML = "";

    var allBtn = document.createElement("button");
    allBtn.className = "shape-chip" + (state.selected === "all" ? " active" : "");
    allBtn.innerHTML = "<span>Все</span>";
    allBtn.style.setProperty("--shape-color", "#201E1A");
    allBtn.addEventListener("click", function () {
      state.selected = "all";
      renderShapeFilter();
      renderFretboard();
    });
    shapeFilterEl.appendChild(allBtn);

    if (state.view === "caged") {
      CagedData.order.forEach(function (name) {
        var btn = document.createElement("button");
        btn.className = "shape-chip" + (isVisible(name) && state.selected !== "all" ? " active" : "");
        btn.innerHTML = "<span>" + name + "(f)</span>";
        btn.style.setProperty("--shape-color", CagedData.color[name]);
        btn.addEventListener("click", function () {
          toggleSelection(name);
          renderShapeFilter();
          renderFretboard();
        });
        shapeFilterEl.appendChild(btn);
      });
    } else {
      BoxesData.boxes.forEach(function (box, b) {
        var btn = document.createElement("button");
        btn.className = "shape-chip" + (isVisible(b) && state.selected !== "all" ? " active" : "");
        btn.innerHTML = "<span>" + box.id + "</span>";
        btn.title = box.mode;
        btn.style.setProperty("--shape-color", box.color);
        btn.addEventListener("click", function () {
          toggleSelection(b);
          renderShapeFilter();
          renderFretboard();
        });
        shapeFilterEl.appendChild(btn);
      });
    }
  }

  function renderLegend() {
    if (state.view === "caged") {
      var thirdLabel = state.mode === "moll" ? "Терция (b3)" : "Терция (3)";
      legendEl.innerHTML =
        '<div class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span> Тоника (R)</div>' +
        '<div class="legend-item"><span class="legend-dot" style="background:var(--third)"></span> ' + thirdLabel + "</div>" +
        '<div class="legend-item"><span class="legend-dot" style="background:var(--fifth)"></span> Квинта (5)</div>';
    } else {
      legendEl.innerHTML =
        '<div class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span> Тоника мажора (R)</div>' +
        '<div class="legend-item"><span class="legend-dot" style="background:var(--relminor)"></span> Тоника минора (r)</div>' +
        '<div class="legend-item"><span class="legend-dot" style="background:var(--other)"></span> Остальные ступени</div>';
    }
  }

  function currentChords() {
    var mode = state.mode === "moll" ? "minor" : "major";
    return Theory.diatonicChords(keySemitone(state.key), mode, false);
  }

  // Ступени гаммы — про тональность, а не про EDCAG/BOX, поэтому рендерится
  // независимо от view (живёт в блоке 1, под переключателем EDCAG/BOX).
  function renderDegreeMiniRow() {
    var chords = currentChords();
    degreeMiniRowEl.innerHTML = "";
    chords.forEach(function (chord) {
      var cell = document.createElement("div");
      cell.className = "degree-mini";
      cell.innerHTML = '<span class="roman">' + chord.roman + '</span><span class="name">' + chord.name + "</span>";
      degreeMiniRowEl.appendChild(cell);
    });
  }

  function renderSequenceRow() {
    var chords = currentChords();
    sequenceGridEl.innerHTML = "";

    if (progressionSelected === null) {
      for (var i = 0; i < 4; i++) {
        var placeholder = document.createElement("div");
        placeholder.className = "sequence-tile";
        placeholder.style.visibility = "hidden";
        placeholder.innerHTML = '<span class="roman">·</span><span class="name">·</span>';
        sequenceGridEl.appendChild(placeholder);
      }
      return;
    }

    ProgressionsData.progressions[progressionSelected].degrees.forEach(function (d) {
      var chord = chords[d - 1];
      var cell = document.createElement("div");
      cell.className = "sequence-tile";
      cell.innerHTML = '<span class="roman">' + chord.roman + '</span><span class="name">' + chord.name + "</span>";
      sequenceGridEl.appendChild(cell);
    });
  }

  function renderProgressionFilter() {
    progressionFilterEl.innerHTML = "";
    ProgressionsData.progressions.forEach(function (p, idx) {
      var btn = document.createElement("button");
      btn.className = "progression-chip" + (progressionSelected === idx ? " active" : "");
      btn.textContent = p.label;
      btn.addEventListener("click", function () {
        progressionSelected = progressionSelected === idx ? null : idx;
        renderProgressionFilter();
        renderSequenceRow();
      });
      progressionFilterEl.appendChild(btn);
    });
  }

  // Кастомный дропдаун секвенций (js/data/sequences.js) для BOX-режима —
  // чисто информационный выбор паттерна с превью-"кубиками", ни на что
  // больше не влияет (как и в референсе).
  var sequenceSelected = 0;

  function cubesHTML(numbers) {
    return numbers.map(function (n) { return '<span class="seq-cube">' + n + "</span>"; }).join("");
  }

  function renderSeqToggle() {
    var seq = SequencesData.sequences[sequenceSelected];
    seqToggleLabelEl.textContent = seq.name;
    seqTogglePreviewEl.innerHTML = cubesHTML(seq.numbers);
  }

  function renderSeqPanel() {
    seqPanelEl.innerHTML = "";
    SequencesData.sequences.forEach(function (seq, idx) {
      var row = document.createElement("div");
      row.className = "seq-option";
      row.innerHTML = '<span class="seq-name">' + seq.name + '</span><span class="seq-cubes">' + cubesHTML(seq.numbers) + "</span>";
      row.addEventListener("click", function () {
        sequenceSelected = idx;
        renderSeqToggle();
        seqPanelEl.classList.remove("open");
      });
      seqPanelEl.appendChild(row);
    });
  }

  seqToggleEl.addEventListener("click", function () {
    seqPanelEl.classList.toggle("open");
  });
  document.addEventListener("click", function (e) {
    var dd = document.querySelector(".seq-dropdown");
    if (dd && !dd.contains(e.target)) seqPanelEl.classList.remove("open");
  });

  function setView(view) {
    state.view = view;
    state.selected = "all";
    document.querySelectorAll(".view-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === view);
    });
    group3CagedEl.style.display = view === "caged" ? "" : "none";
    group3BoxesEl.style.display = view === "boxes" ? "" : "none";
    renderShapeFilter();
    renderLegend();
    renderFretboard();
  }

  document.querySelectorAll(".view-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { setView(btn.dataset.view); });
  });

  document.querySelectorAll(".durmoll-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.mode = btn.dataset.durmoll;
      document.querySelectorAll(".durmoll-btn").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      renderLegend();
      renderFretboard();
      renderDegreeMiniRow();
      renderSequenceRow();
    });
  });

  renderKeys();
  setView("caged");
  renderDegreeMiniRow();
  renderProgressionFilter();
  renderSequenceRow();
  renderSeqToggle();
  renderSeqPanel();
})();
