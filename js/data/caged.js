/*
 * EDCAG — те же 5 стандартных открытых аппликатур (C-A-G-E-D), что и раньше,
 * только порядок показа и название вкладки теперь "от E" (E-D-C-A-G) и поля
 * заданы через ступень гаммы (degree), а не через "роль" — это ровно формат
 * из провалидированного на гитаре референса (fretflow-fretboard-screen.html),
 * перенесённый без изменений.
 *
 * string: 1..6 (1 = самая тонкая/высокое e, 6 = самая толстая/низкое E),
 * fret: абсолютный номер лада В ЕСТЕСТВЕННОЙ открытой позиции формы,
 * degree: ступень гаммы '1' (тоника) | '3' (терция) | '5' (квинта).
 *
 * nativeRootSemitone — pitch-class тоники формы без баррэ (0=C..11=B).
 * Транспонизация в другую тональность — сдвиг всех ладов на разницу
 * полутонов между целевой тональностью и nativeRootSemitone (баррэ),
 * см. shapeAnchor() в js/fretboard-screen.js.
 *
 * В миноре терция (degree '3') опускается на полтона (см. getShapeNotes()
 * в js/fretboard-screen.js) — это тоже перенесено из референса как есть.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.CagedData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var order = ["E", "D", "C", "A", "G"];

  var color = { E: "#7C7AA6", D: "#4F8FA6", C: "#C1633E", A: "#6B8A6E", G: "#B98B3E" };

  var nativeRootSemitone = { C: 0, A: 9, G: 7, E: 4, D: 2 };

  var shapes = {
    C: [
      { string: 5, fret: 3, degree: "1" },
      { string: 4, fret: 2, degree: "3" },
      { string: 3, fret: 0, degree: "5" },
      { string: 2, fret: 1, degree: "1" },
      { string: 1, fret: 0, degree: "3" }
    ],
    A: [
      { string: 5, fret: 0, degree: "1" },
      { string: 4, fret: 2, degree: "5" },
      { string: 3, fret: 2, degree: "1" },
      { string: 2, fret: 2, degree: "3" },
      { string: 1, fret: 0, degree: "5" }
    ],
    G: [
      { string: 6, fret: 3, degree: "1" },
      { string: 5, fret: 2, degree: "3" },
      { string: 4, fret: 0, degree: "5" },
      { string: 3, fret: 0, degree: "1" },
      { string: 2, fret: 0, degree: "3" },
      { string: 1, fret: 3, degree: "1" }
    ],
    E: [
      { string: 6, fret: 0, degree: "1" },
      { string: 5, fret: 2, degree: "5" },
      { string: 4, fret: 2, degree: "1" },
      { string: 3, fret: 1, degree: "3" },
      { string: 2, fret: 0, degree: "5" },
      { string: 1, fret: 0, degree: "1" }
    ],
    D: [
      { string: 4, fret: 0, degree: "1" },
      { string: 3, fret: 2, degree: "5" },
      { string: 2, fret: 3, degree: "1" },
      { string: 1, fret: 2, degree: "3" }
    ]
  };

  return { order: order, color: color, nativeRootSemitone: nativeRootSemitone, shapes: shapes };
});
