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
  var progressionPanelEl = document.getElementById("progressionPanel");
  var progressionFilterEl = document.getElementById("progressionFilter");
  var degreeGridEl = document.getElementById("degreeGrid");
  var sequenceGridEl = document.getElementById("sequenceGrid");
  var boxSequencesPanelEl = document.getElementById("boxSequencesPanel");
  var boxSequencesListEl = document.getElementById("boxSequencesList");

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
        renderDegreeGrid();
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

  function renderDegreeGrid() {
    var chords = currentChords();
    degreeGridEl.innerHTML = "";
    chords.forEach(function (chord) {
      var cell = document.createElement("div");
      cell.className = "degree-tile";
      cell.innerHTML = '<span class="degree-roman">' + chord.roman + '</span><span class="degree-name">' + chord.name + "</span>";
      degreeGridEl.appendChild(cell);
    });
  }

  function renderSequenceRow() {
    var chords = currentChords();
    sequenceGridEl.innerHTML = "";

    if (progressionSelected === null) {
      for (var i = 0; i < 4; i++) {
        var placeholder = document.createElement("div");
        placeholder.className = "degree-tile sequence-tile";
        placeholder.style.visibility = "hidden";
        placeholder.innerHTML = '<span class="degree-roman">·</span><span class="degree-name">·</span>';
        sequenceGridEl.appendChild(placeholder);
      }
      return;
    }

    ProgressionsData.progressions[progressionSelected].degrees.forEach(function (d) {
      var chord = chords[d - 1];
      var cell = document.createElement("div");
      cell.className = "degree-tile sequence-tile";
      cell.innerHTML = '<span class="degree-roman">' + chord.roman + '</span><span class="degree-name">' + chord.name + "</span>";
      sequenceGridEl.appendChild(cell);
    });
  }

  function renderProgressionFilter() {
    progressionFilterEl.innerHTML = "";
    ProgressionsData.progressions.forEach(function (p, idx) {
      var btn = document.createElement("button");
      btn.className = "shape-chip" + (progressionSelected === idx ? " active" : "");
      btn.innerHTML = '<span style="font-size:13px;">' + p.label + "</span>";
      btn.style.setProperty("--shape-color", "#C1633E");
      btn.addEventListener("click", function () {
        progressionSelected = progressionSelected === idx ? null : idx;
        renderProgressionFilter();
        renderDegreeGrid();
        renderSequenceRow();
      });
      progressionFilterEl.appendChild(btn);
    });
  }

  // Мелодические секвенции (js/data/sequences.js) — не часть референса,
  // сохранены из прежней версии по решению пользователя: показываем их
  // только в виде BOX, простым текстовым списком без интерактива.
  function renderBoxSequences() {
    boxSequencesPanelEl.hidden = state.view !== "boxes";
    if (state.view !== "boxes") return;
    boxSequencesListEl.innerHTML = "";
    SequencesData.sequences.forEach(function (seq) {
      var li = document.createElement("li");
      li.textContent = seq.name + ": " + seq.numbers.join("-");
      boxSequencesListEl.appendChild(li);
    });
  }

  function setView(view) {
    state.view = view;
    state.selected = "all";
    document.querySelectorAll(".view-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === view);
    });
    // "Ступени гаммы" + прогрессии — только для EDCAG, в BOX-режиме их
    // заменяет плоский список секвенций (см. renderBoxSequences).
    progressionPanelEl.hidden = view !== "caged";
    renderShapeFilter();
    renderLegend();
    renderFretboard();
    renderBoxSequences();
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
      renderDegreeGrid();
      renderSequenceRow();
    });
  });

  renderKeys();
  setView("caged");
  renderProgressionFilter();
  renderDegreeGrid();
  renderSequenceRow();
})();
