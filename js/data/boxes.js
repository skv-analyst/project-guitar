/*
 * 7 боксов лада (3-notes-per-string система) — СТАТИЧЕСКИЕ, эмпирически
 * проверенные данные (сверено вручную на гитаре), перенесены как есть из
 * fretflow-fretboard-screen.html. Старая формула generateBoxes() (сдвиг
 * окна по вычисленной мажорной гамме) при ручной проверке разошлась с
 * реальностью на грифе — она сюда больше не переносится.
 *
 * degrees[boxIndex] — объект по номеру струны (1..6, 1 = высокое e), каждая
 * запись { fret, degree }: fret — ОТНОСИТЕЛЬНЫЙ номер лада (от якоря бокса,
 * см. nativeAnchorE + boxAnchor() в js/fretboard-screen.js), degree —
 * ступень гаммы '1'..'7' (не "роль" — тоника мажора это ступень '1', тоника
 * относительного минора — ступень '6').
 *
 * nativeAnchorE[i] — стартовый (якорный) лад бокса i, когда тональность = E
 * (наша точка отсчёта на грифе).
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.BoxesData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var modeNames = ["Ионийский", "Дорийский", "Фригийский", "Лидийский", "Миксолидийский", "Эолийский", "Локрийский"];

  var color = ["#C1633E", "#B98B3E", "#8B8B4E", "#6B8A6E", "#4F8FA6", "#7C7AA6", "#A6588B"];

  var nativeAnchorE = [0, 2, 4, 5, 7, 9, 11];

  var degrees = [
    // box 1 — Ионийский
    {
      1: [{ fret: 2, degree: "2" }, { fret: 4, degree: "3" }, { fret: 5, degree: "4" }],
      2: [{ fret: 2, degree: "6" }, { fret: 4, degree: "7" }, { fret: 5, degree: "1" }],
      3: [{ fret: 1, degree: "3" }, { fret: 2, degree: "4" }, { fret: 4, degree: "5" }],
      4: [{ fret: 1, degree: "7" }, { fret: 2, degree: "1" }, { fret: 4, degree: "2" }],
      5: [{ fret: 0, degree: "4" }, { fret: 2, degree: "5" }, { fret: 4, degree: "6" }],
      6: [{ fret: 0, degree: "1" }, { fret: 2, degree: "2" }, { fret: 4, degree: "3" }]
    },
    // box 2 — Дорийский
    {
      1: [{ fret: 2, degree: "3" }, { fret: 3, degree: "4" }, { fret: 5, degree: "5" }],
      2: [{ fret: 2, degree: "7" }, { fret: 3, degree: "1" }, { fret: 5, degree: "2" }],
      3: [{ fret: 0, degree: "4" }, { fret: 2, degree: "5" }, { fret: 4, degree: "6" }],
      4: [{ fret: 0, degree: "1" }, { fret: 2, degree: "2" }, { fret: 4, degree: "3" }],
      5: [{ fret: 0, degree: "5" }, { fret: 2, degree: "6" }, { fret: 4, degree: "7" }],
      6: [{ fret: 0, degree: "2" }, { fret: 2, degree: "3" }, { fret: 3, degree: "4" }]
    },
    // box 3 — Фригийский
    {
      1: [{ fret: 1, degree: "4" }, { fret: 3, degree: "5" }, { fret: 5, degree: "6" }],
      2: [{ fret: 1, degree: "1" }, { fret: 3, degree: "2" }, { fret: 5, degree: "3" }],
      3: [{ fret: 0, degree: "5" }, { fret: 2, degree: "6" }, { fret: 4, degree: "7" }],
      4: [{ fret: 0, degree: "2" }, { fret: 2, degree: "3" }, { fret: 3, degree: "4" }],
      5: [{ fret: 0, degree: "6" }, { fret: 2, degree: "7" }, { fret: 3, degree: "1" }],
      6: [{ fret: 0, degree: "3" }, { fret: 1, degree: "4" }, { fret: 3, degree: "5" }]
    },
    // box 4 — Лидийский
    {
      1: [{ fret: 2, degree: "5" }, { fret: 4, degree: "6" }, { fret: 6, degree: "7" }],
      2: [{ fret: 2, degree: "2" }, { fret: 4, degree: "3" }, { fret: 5, degree: "4" }],
      3: [{ fret: 1, degree: "6" }, { fret: 3, degree: "7" }, { fret: 4, degree: "1" }],
      4: [{ fret: 1, degree: "3" }, { fret: 2, degree: "4" }, { fret: 4, degree: "5" }],
      5: [{ fret: 1, degree: "7" }, { fret: 2, degree: "1" }, { fret: 4, degree: "2" }],
      6: [{ fret: 0, degree: "4" }, { fret: 2, degree: "5" }, { fret: 4, degree: "6" }]
    },
    // box 5 — Миксолидийский
    {
      1: [{ fret: 2, degree: "6" }, { fret: 4, degree: "7" }, { fret: 5, degree: "1" }],
      2: [{ fret: 2, degree: "3" }, { fret: 3, degree: "4" }],
      3: [{ fret: 1, degree: "7" }, { fret: 2, degree: "1" }, { fret: 4, degree: "2" }],
      4: [{ fret: 0, degree: "4" }, { fret: 2, degree: "5" }, { fret: 4, degree: "6" }],
      5: [{ fret: 0, degree: "1" }, { fret: 2, degree: "2" }, { fret: 4, degree: "3" }],
      6: [{ fret: 0, degree: "5" }, { fret: 2, degree: "6" }, { fret: 4, degree: "7" }]
    },
    // box 6 — Эолийский
    {
      1: [{ fret: 2, degree: "7" }, { fret: 3, degree: "1" }, { fret: 5, degree: "2" }],
      2: [{ fret: 1, degree: "4" }, { fret: 3, degree: "5" }, { fret: 5, degree: "6" }],
      3: [{ fret: 0, degree: "1" }, { fret: 2, degree: "2" }, { fret: 4, degree: "3" }],
      4: [{ fret: 0, degree: "5" }, { fret: 2, degree: "6" }, { fret: 4, degree: "7" }],
      5: [{ fret: 0, degree: "2" }, { fret: 2, degree: "3" }, { fret: 3, degree: "4" }],
      6: [{ fret: 0, degree: "6" }, { fret: 2, degree: "7" }, { fret: 3, degree: "1" }]
    },
    // box 7 — Локрийский
    {
      1: [{ fret: 1, degree: "1" }, { fret: 3, degree: "2" }, { fret: 5, degree: "3" }],
      2: [{ fret: 1, degree: "5" }, { fret: 3, degree: "6" }, { fret: 5, degree: "7" }],
      3: [{ fret: 0, degree: "2" }, { fret: 2, degree: "3" }, { fret: 3, degree: "4" }],
      4: [{ fret: 0, degree: "6" }, { fret: 2, degree: "7" }, { fret: 3, degree: "1" }],
      5: [{ fret: 0, degree: "3" }, { fret: 1, degree: "4" }, { fret: 3, degree: "5" }],
      6: [{ fret: 0, degree: "7" }, { fret: 1, degree: "1" }, { fret: 3, degree: "2" }]
    }
  ];

  var boxes = degrees.map(function (byString, i) {
    return {
      id: i + 1,
      mode: modeNames[i],
      title: modeNames[i] + " бокс",
      color: color[i],
      nativeAnchorE: nativeAnchorE[i],
      degrees: byString
    };
  });

  return { modeNames: modeNames, boxes: boxes };
});
