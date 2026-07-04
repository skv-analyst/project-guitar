/*
 * Экран CAGED: табы форм (C A G E D) + квинтовый круг для выбора тональности.
 * Транспонизация формы = баррэ-сдвиг (offset = target - openRootPc), см. бриф
 * про табличную/детерминированную транспонизацию — здесь тот же принцип,
 * применённый к аппликатуре, а не к аккордам прогрессии.
 */
(function () {
  "use strict";

  var shapeTabsEl = document.getElementById("caged-shape-tabs");
  var svg = document.getElementById("caged-fretboard");
  var circleSvg = document.getElementById("circle-of-fifths");
  var progressionEl = document.getElementById("chord-progression");

  var state = {
    shapeId: "C",
    rootPc: 0,
    mode: "major",
    useFlats: false
  };

  function transposeShape(shape, targetPc) {
    var offset = Theory.pcOf(targetPc - shape.openRootPc);
    var notes = shape.notes.map(function (n) {
      return { string: n.string, fret: n.fret + offset, role: n.role };
    });
    var maxOriginal = Math.max.apply(null, shape.notes.map(function (n) { return n.fret; }));
    var fretStart = Math.max(0, offset - 1);
    var fretCount = Math.max(4, maxOriginal + offset - fretStart);
    return { notes: notes, muted: shape.muted, fretStart: fretStart, fretCount: fretCount, offset: offset };
  }

  function renderShapeTabs() {
    shapeTabsEl.innerHTML = "";
    CagedData.shapes.forEach(function (shape) {
      var btn = document.createElement("button");
      btn.className = "shape-tab" + (shape.id === state.shapeId ? " active" : "");
      btn.textContent = shape.title;
      btn.addEventListener("click", function () {
        state.shapeId = shape.id;
        renderShapeTabs();
        renderFretboard();
      });
      shapeTabsEl.appendChild(btn);
    });
  }

  function renderProgression() {
    var chords = Theory.diatonicChords(state.rootPc, state.mode, state.useFlats);
    progressionEl.innerHTML = "";
    chords.forEach(function (chord) {
      var chip = document.createElement("div");
      chip.className = "chord-chip";
      var roman = document.createElement("span");
      roman.className = "roman";
      roman.textContent = chord.roman;
      chip.appendChild(roman);
      chip.appendChild(document.createTextNode(chord.name));
      progressionEl.appendChild(chip);
    });
  }

  function renderFretboard() {
    var shape = CagedData.shapes.filter(function (s) { return s.id === state.shapeId; })[0];
    var transposed = transposeShape(shape, state.rootPc);
    var chordName = Theory.noteName(state.rootPc, state.useFlats);
    Fretboard.render(svg, {
      strings: 6,
      fretStart: transposed.fretStart,
      fretCount: transposed.fretCount,
      notes: transposed.notes,
      muted: transposed.muted,
      title: "Форма " + shape.id + " → аккорд " + chordName + " (мажор)"
    });
  }

  function selectKey(pc, mode, useFlats) {
    state.rootPc = pc;
    state.mode = mode;
    state.useFlats = useFlats;
    CircleOfFifths.setSelected(circleSvg, pc, mode);
    renderProgression();
    renderFretboard();
  }

  CircleOfFifths.render(circleSvg, selectKey);
  renderShapeTabs();
  selectKey(0, "major", false);
})();
