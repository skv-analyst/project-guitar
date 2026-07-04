/*
 * Экран "Боксы": табы BOX 1..7 + панель секвенций поверх выбранного бокса.
 */
(function () {
  "use strict";

  var pickerEl = document.getElementById("box-picker");
  var svg = document.getElementById("box-fretboard");
  var sequenceSelect = document.getElementById("sequence-select");
  var sequenceView = document.getElementById("sequence-view");

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
    var maxFret = Math.max.apply(null, box.notes.map(function (n) { return n.fret; }));
    Fretboard.render(svg, {
      strings: 6,
      fretStart: 0,
      fretCount: Math.max(6, maxFret),
      notes: box.notes,
      muted: [],
      title: "BOX " + box.id + " — " + box.title
    });
  }

  function renderSequenceOptions() {
    sequenceSelect.innerHTML = "";
    SequencesData.sequences.forEach(function (seq) {
      var opt = document.createElement("option");
      opt.value = seq.id;
      opt.textContent = seq.name;
      sequenceSelect.appendChild(opt);
    });
  }

  function renderSequenceView() {
    var seq = SequencesData.sequences.filter(function (s) { return s.id === sequenceSelect.value; })[0];
    if (!seq) {
      sequenceView.innerHTML = "";
      return;
    }
    sequenceView.innerHTML = "";
    var name = document.createElement("div");
    name.className = "seq-name";
    name.textContent = seq.name;
    sequenceView.appendChild(name);
    var numbers = document.createElement("div");
    numbers.textContent = seq.numbers.join(" - ");
    sequenceView.appendChild(numbers);
  }

  sequenceSelect.addEventListener("change", renderSequenceView);

  renderPicker();
  renderFretboard();
  renderSequenceOptions();
  renderSequenceView();
})();
