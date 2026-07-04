/*
 * Оцифровано по reference/major-form-c.png, major-form-a.png, major-form-g.png,
 * major-form-e.png, major-form-d.png — на них явно подписаны R (тоника), 3, 5,
 * плюс O (открытая струна) / X (не играется).
 *
 * Каждая форма хранится в её "естественной" открытой позиции (как в скрине),
 * ровно то что нарисовано: string 1..6 (1 = самая тонкая/высокое E, 6 = самая
 * толстая/низкое E — так же пронумеровано на скринах), fret — абсолютный номер
 * лада В ЭТОЙ открытой позиции (0 = открытая струна).
 *
 * openRootPc — какую тонику (pitch class) даёт форма без баррэ (в открытой
 * позиции). Это стандартная, общеизвестная теория открытых аккордов
 * (C-A-G-E-D), не выдумка: форма C открытая = аккорд C, форма A = A, форма G = G,
 * форма E = E, форма D = D. Транспонизация в другую тональность — это баррэ,
 * т.е. просто сдвиг всех ладов на (target - openRootPc) полутонов, см. js/fretboard.js.
 *
 * Серые ("доп.") точки на скринах не оцифрованы — их роль неочевидна, а бриф
 * просит только тонику/3/5 (плюс минорную тонику — добавим отдельным заходом).
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.CagedData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var shapes = [
    {
      id: "C",
      title: "Форма C",
      openRootPc: 0, // C
      muted: [6],
      notes: [
        { string: 1, fret: 0, role: "third" },
        { string: 2, fret: 1, role: "root" },
        { string: 3, fret: 0, role: "fifth" },
        { string: 4, fret: 2, role: "third" },
        { string: 5, fret: 3, role: "root" }
      ]
    },
    {
      id: "A",
      title: "Форма A",
      openRootPc: 9, // A
      muted: [6],
      notes: [
        { string: 1, fret: 0, role: "fifth" },
        { string: 2, fret: 2, role: "third" },
        { string: 3, fret: 2, role: "root" },
        { string: 4, fret: 2, role: "fifth" },
        { string: 5, fret: 0, role: "root" }
      ]
    },
    {
      id: "G",
      title: "Форма G",
      openRootPc: 7, // G
      muted: [],
      notes: [
        { string: 1, fret: 3, role: "root" },
        { string: 2, fret: 0, role: "third" },
        { string: 3, fret: 0, role: "root" },
        { string: 4, fret: 0, role: "fifth" },
        { string: 5, fret: 2, role: "third" },
        { string: 6, fret: 3, role: "root" }
      ]
    },
    {
      id: "E",
      title: "Форма E",
      openRootPc: 4, // E
      muted: [],
      notes: [
        { string: 1, fret: 0, role: "root" },
        { string: 2, fret: 0, role: "fifth" },
        { string: 3, fret: 1, role: "third" },
        { string: 4, fret: 2, role: "root" },
        { string: 5, fret: 2, role: "fifth" },
        { string: 6, fret: 0, role: "root" }
      ]
    },
    {
      id: "D",
      title: "Форма D",
      openRootPc: 2, // D
      muted: [5, 6],
      notes: [
        { string: 1, fret: 2, role: "third" },
        { string: 2, fret: 3, role: "root" },
        { string: 3, fret: 2, role: "fifth" },
        { string: 4, fret: 0, role: "root" }
      ]
    }
  ];

  return { shapes: shapes };
});
