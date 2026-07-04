/*
 * Секвенции — наборы чисел (ступеней) с названием паттерна, как задано.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.SequencesData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var sequences = [
    { id: "four-note", name: "4-нотная", numbers: [1, 2, 3, 4] },
    { id: "three-note", name: "3-х нотная", numbers: [1, 2, 3] },
    { id: "thirds", name: "Терцовая", numbers: [1, 3] },
    { id: "small-return", name: "Малая возвратная", numbers: [1, 2, 3, 1] },
    { id: "fourths", name: "Квартовая", numbers: [1, 4] },
    { id: "bass", name: "Басовая", numbers: [1, 4, 3] },
    { id: "fifths", name: "Квинтовая", numbers: [1, 5] },
    { id: "big-return", name: "Большая возвратная", numbers: [1, 5, 4, 3, 4, 3, 2, 1] },
    { id: "sixths", name: "Секстовая", numbers: [1, 6] },
    { id: "chord", name: "Аккордовая", numbers: [1, 3, 5] },
    { id: "sevenths", name: "Септовая", numbers: [1, 7] },
    { id: "encircling", name: "Опевание", numbers: [2, 1, 2, 4] },
    { id: "reverse-seventh", name: "Обратный септаккорд", numbers: [1, 7, 3, 5] },
    { id: "broken", name: "Ломаная", numbers: [1, 4, 2, 3] },
    { id: "full-chord", name: "Полный аккорд", numbers: [1, 3, 5, 8] }
  ];

  return { sequences: sequences };
});
