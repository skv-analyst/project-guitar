/*
 * Экран CAGED.
 *
 * Сами формы (C A G E D) — фиксированная референсная аппликатура, она не
 * зависит от тональности (баррэ передвигаешь по грифу сам), поэтому все 5
 * рисуются один раз, рядом, в открытой позиции.
 *
 * Квинтовый круг тут работает иначе: клик по тональности не перерисовывает
 * гриф, а генерирует "задание" — короткую (4 ступени) последовательность
 * аккордов в этой тональности из набора известных классических прогрессий,
 * плюс полную лесенку ступеней гаммы для справки. И то, и другое — табличная
 * транспонизация из js/theory.js, не выдумывание аккордов на глаз.
 */
(function () {
  "use strict";

  var shapesRowEl = document.getElementById("caged-shapes-row");
  var circleSvg = document.getElementById("circle-of-fifths");
  var progressionSelect = document.getElementById("progression-select");
  var taskProgressionEl = document.getElementById("task-progression");
  var scaleStepsEl = document.getElementById("chord-progression");

  // Классические прогрессии, заданные ступенями гаммы (1-based индекс в
  // диатонической лесенке) — общеизвестные, устоявшиеся схемы, а не наш выбор.
  var MAJOR_PROGRESSIONS = [
    { id: "I-V-vi-IV", label: "I – V – vi – IV", degrees: [1, 5, 6, 4] },
    { id: "I-vi-IV-V", label: "I – vi – IV – V", degrees: [1, 6, 4, 5] },
    { id: "vi-IV-I-V", label: "vi – IV – I – V", degrees: [6, 4, 1, 5] },
    { id: "ii-V-I-vi", label: "ii – V – I – vi", degrees: [2, 5, 1, 6] }
  ];

  var MINOR_PROGRESSIONS = [
    { id: "i-VI-III-VII", label: "i – VI – III – VII", degrees: [1, 6, 3, 7] },
    { id: "i-iv-v-i", label: "i – iv – v – i", degrees: [1, 4, 5, 1] },
    { id: "i-VII-VI-VII", label: "i – VII – VI – VII", degrees: [1, 7, 6, 7] }
  ];

  var state = { rootPc: 0, mode: "major", useFlats: false, progressionId: MAJOR_PROGRESSIONS[0].id };

  function renderShapes() {
    shapesRowEl.innerHTML = "";
    CagedData.shapes.forEach(function (shape) {
      var card = document.createElement("div");
      card.className = "caged-shape-card";

      var label = document.createElement("div");
      label.className = "caged-shape-name";
      label.textContent = "f" + shape.id;
      card.appendChild(label);

      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      card.appendChild(svg);
      shapesRowEl.appendChild(card);

      var maxFret = Math.max.apply(null, shape.notes.map(function (n) { return n.fret; }));
      Fretboard.render(svg, {
        compact: true,
        showNumbers: false,
        width: 340,
        height: 400,
        strings: 6,
        fretStart: 0,
        fretCount: Math.max(4, maxFret),
        notes: shape.notes,
        muted: shape.muted
      });
    });
  }

  function currentProgressions() {
    return state.mode === "minor" ? MINOR_PROGRESSIONS : MAJOR_PROGRESSIONS;
  }

  function renderProgressionOptions() {
    var list = currentProgressions();
    progressionSelect.innerHTML = "";
    list.forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.label;
      progressionSelect.appendChild(opt);
    });
    if (!list.some(function (p) { return p.id === state.progressionId; })) {
      state.progressionId = list[0].id;
    }
    progressionSelect.value = state.progressionId;
  }

  function chipsFor(container, chords, big) {
    container.innerHTML = "";
    chords.forEach(function (chord) {
      var chip = document.createElement("div");
      chip.className = "chord-chip";
      var roman = document.createElement("span");
      roman.className = "roman";
      roman.textContent = chord.roman;
      chip.appendChild(roman);
      chip.appendChild(document.createTextNode(chord.name));
      container.appendChild(chip);
    });
  }

  function renderTask() {
    var list = currentProgressions();
    var progression = list.filter(function (p) { return p.id === state.progressionId; })[0] || list[0];
    var allChords = Theory.diatonicChords(state.rootPc, state.mode, state.useFlats);
    var taskChords = progression.degrees.map(function (degree) { return allChords[degree - 1]; });
    chipsFor(taskProgressionEl, taskChords);
  }

  function renderScaleSteps() {
    var allChords = Theory.diatonicChords(state.rootPc, state.mode, state.useFlats);
    chipsFor(scaleStepsEl, allChords);
  }

  function selectKey(pc, mode, useFlats) {
    state.rootPc = pc;
    state.mode = mode;
    state.useFlats = useFlats;
    CircleOfFifths.setSelected(circleSvg, pc, mode);
    renderProgressionOptions();
    renderTask();
    renderScaleSteps();
  }

  progressionSelect.addEventListener("change", function () {
    state.progressionId = progressionSelect.value;
    renderTask();
  });

  CircleOfFifths.render(circleSvg, selectKey);
  renderShapes();
  selectKey(0, "major", false);
})();
