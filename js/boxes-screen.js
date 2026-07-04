/*
 * Экран "Боксы": табы BOX 1..7 + сразу все секвенции сеткой под грифом
 * (без выпадающего списка — чтобы всё было видно одним взглядом).
 */
(function () {
  "use strict";

  var pickerEl = document.getElementById("box-picker");
  var svg = document.getElementById("box-fretboard");
  var sequencesGridEl = document.getElementById("sequences-grid");

  var state = { boxId: 1 };

  function renderPicker() {
    pickerEl.innerHTML = "";
    BoxesData.boxes.forEach(function (box) {
      var btn = document.createElement("button");
      btn.className = "box-tab" + (box.id === state.boxId ? " active" : "");
      btn.textContent = "BOX " + box.id;
      btn.title = box.title;
      btn.addEventListener("click", function () {
        state.boxId = box.id;
        renderPicker();
        renderFretboard();
      });
      pickerEl.appendChild(btn);
    });
  }

  function renderFretboard() {
    var box = BoxesData.boxes.filter(function (b) { return b.id === state.boxId; })[0];
    var frets = box.notes.map(function (n) { return n.fret; });
    var fretStart = Math.min.apply(null, frets) - 1;
    Fretboard.render(svg, {
      strings: 6,
      fretStart: fretStart,
      fretCount: 7,
      showFretNumbers: false,
      notes: box.notes,
      muted: [],
      title: "BOX " + box.id + " — " + box.title
    });
  }

  function renderSequencesGrid() {
    sequencesGridEl.innerHTML = "";
    SequencesData.sequences.forEach(function (seq) {
      var li = document.createElement("li");
      li.textContent = seq.name + ": " + seq.numbers.join("-");

      sequencesGridEl.appendChild(li);
    });
  }

  renderPicker();
  renderFretboard();
  renderSequencesGrid();
})();
