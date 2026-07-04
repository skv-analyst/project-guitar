/*
 * Оцифровано по reference/box-minor-major-1..7.png + box-minor-major-legend.png.
 *
 * Конвенция:
 *  - string: 1..6, где 1 = самая тонкая струна (высокое E), 6 = самая толстая (низкое E) —
 *    так как на скриншотах ряд "1" нарисован сверху, "6" снизу (аналогично TAB-нотации).
 *  - fret: ОТНОСИТЕЛЬНЫЙ номер лада внутри бокса (1..6 слева направо на скрине),
 *    не абсолютный номер лада на грифе — бокс движим и накладывается на любой лад.
 *  - role: 'majorTonic' (синяя точка на скрине) | 'minorTonic' (красная) | 'other' (серая).
 *
 * ВНИМАНИЕ: боксы 2 (Дорийский) и 3 (Фригийский) прочитаны с меньшей уверенностью —
 * на скриншотах есть неоднозначные места (сгустки точек рядом с "изгибом" контура бокса).
 * Остальные 5 боксов прочитаны уверенно. Сверь визуально с оригиналами перед тем как
 * полагаться на них в занятиях — см. итоговое сообщение с разбором по каждому боксу.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.BoxesData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var boxes = [
    {
      id: 1,
      mode: "Ionian",
      title: "Ионийский бокс",
      confidence: "high",
      notes: [
        { string: 1, fret: 3, role: "other" },
        { string: 1, fret: 5, role: "other" },
        { string: 1, fret: 6, role: "other" },
        { string: 2, fret: 3, role: "minorTonic" },
        { string: 2, fret: 5, role: "other" },
        { string: 2, fret: 6, role: "majorTonic" },
        { string: 3, fret: 2, role: "other" },
        { string: 3, fret: 3, role: "other" },
        { string: 3, fret: 5, role: "other" },
        { string: 4, fret: 2, role: "other" },
        { string: 4, fret: 3, role: "majorTonic" },
        { string: 4, fret: 5, role: "other" },
        { string: 5, fret: 1, role: "other" },
        { string: 5, fret: 3, role: "other" },
        { string: 5, fret: 5, role: "minorTonic" },
        { string: 6, fret: 1, role: "majorTonic" },
        { string: 6, fret: 3, role: "other" },
        { string: 6, fret: 5, role: "other" }
      ]
    },
    {
      id: 2,
      mode: "Dorian",
      title: "Дорийский бокс",
      confidence: "low",
      notes: [
        { string: 1, fret: 3, role: "other" },
        { string: 1, fret: 4, role: "other" },
        { string: 1, fret: 6, role: "other" },
        { string: 2, fret: 4, role: "majorTonic" },
        { string: 3, fret: 1, role: "other" },
        { string: 3, fret: 3, role: "other" },
        { string: 3, fret: 5, role: "minorTonic" },
        { string: 4, fret: 1, role: "majorTonic" },
        { string: 4, fret: 3, role: "other" },
        { string: 4, fret: 5, role: "other" },
        { string: 5, fret: 1, role: "other" },
        { string: 5, fret: 3, role: "minorTonic" },
        { string: 5, fret: 5, role: "other" },
        { string: 6, fret: 1, role: "other" },
        { string: 6, fret: 3, role: "other" }
      ]
    },
    {
      id: 3,
      mode: "Phrygian",
      title: "Фригийский бокс",
      confidence: "low",
      notes: [
        { string: 1, fret: 2, role: "other" },
        { string: 1, fret: 4, role: "other" },
        { string: 1, fret: 6, role: "minorTonic" },
        { string: 2, fret: 2, role: "majorTonic" },
        { string: 2, fret: 4, role: "other" },
        { string: 2, fret: 6, role: "other" },
        { string: 3, fret: 1, role: "other" },
        { string: 3, fret: 3, role: "minorTonic" },
        { string: 3, fret: 5, role: "other" },
        { string: 4, fret: 1, role: "other" },
        { string: 4, fret: 3, role: "other" },
        { string: 4, fret: 4, role: "other" },
        { string: 5, fret: 1, role: "minorTonic" },
        { string: 5, fret: 3, role: "other" },
        { string: 5, fret: 4, role: "majorTonic" },
        { string: 6, fret: 1, role: "other" },
        { string: 6, fret: 3, role: "other" },
        { string: 6, fret: 4, role: "other" }
      ]
    },
    {
      id: 4,
      mode: "Lydian",
      title: "Лидийский бокс",
      confidence: "high",
      notes: [
        { string: 1, fret: 3, role: "other" },
        { string: 1, fret: 5, role: "minorTonic" },
        { string: 1, fret: 6, role: "other" },
        { string: 2, fret: 3, role: "other" },
        { string: 2, fret: 5, role: "other" },
        { string: 2, fret: 6, role: "other" },
        { string: 3, fret: 2, role: "minorTonic" },
        { string: 3, fret: 4, role: "other" },
        { string: 3, fret: 5, role: "majorTonic" },
        { string: 4, fret: 2, role: "other" },
        { string: 4, fret: 3, role: "other" },
        { string: 4, fret: 5, role: "other" },
        { string: 5, fret: 2, role: "other" },
        { string: 5, fret: 3, role: "majorTonic" },
        { string: 5, fret: 5, role: "other" },
        { string: 6, fret: 1, role: "other" },
        { string: 6, fret: 3, role: "other" },
        { string: 6, fret: 5, role: "minorTonic" }
      ]
    },
    {
      id: 5,
      mode: "Mixolydian",
      title: "Миксолидийский бокс",
      confidence: "high",
      notes: [
        { string: 1, fret: 3, role: "minorTonic" },
        { string: 1, fret: 5, role: "other" },
        { string: 1, fret: 6, role: "majorTonic" },
        { string: 2, fret: 3, role: "other" },
        { string: 2, fret: 5, role: "other" },
        { string: 2, fret: 6, role: "other" },
        { string: 3, fret: 2, role: "other" },
        { string: 3, fret: 3, role: "majorTonic" },
        { string: 3, fret: 5, role: "other" },
        { string: 4, fret: 1, role: "other" },
        { string: 4, fret: 3, role: "other" },
        { string: 4, fret: 5, role: "minorTonic" },
        { string: 5, fret: 1, role: "majorTonic" },
        { string: 5, fret: 3, role: "other" },
        { string: 5, fret: 5, role: "other" },
        { string: 6, fret: 1, role: "other" },
        { string: 6, fret: 3, role: "minorTonic" },
        { string: 6, fret: 5, role: "other" }
      ]
    },
    {
      id: 6,
      mode: "Aeolian",
      title: "Эолийский бокс",
      confidence: "high",
      notes: [
        { string: 1, fret: 3, role: "other" },
        { string: 1, fret: 4, role: "majorTonic" },
        { string: 1, fret: 6, role: "other" },
        { string: 2, fret: 2, role: "other" },
        { string: 2, fret: 4, role: "other" },
        { string: 2, fret: 6, role: "minorTonic" },
        { string: 3, fret: 1, role: "majorTonic" },
        { string: 3, fret: 3, role: "other" },
        { string: 3, fret: 5, role: "other" },
        { string: 4, fret: 1, role: "other" },
        { string: 4, fret: 3, role: "minorTonic" },
        { string: 4, fret: 4, role: "other" },
        { string: 5, fret: 1, role: "other" },
        { string: 5, fret: 3, role: "other" },
        { string: 5, fret: 4, role: "other" },
        { string: 6, fret: 1, role: "minorTonic" },
        { string: 6, fret: 3, role: "other" },
        { string: 6, fret: 4, role: "majorTonic" }
      ]
    },
    {
      id: 7,
      mode: "Locrian",
      title: "Локрийский бокс",
      confidence: "high",
      notes: [
        { string: 1, fret: 2, role: "majorTonic" },
        { string: 1, fret: 4, role: "other" },
        { string: 1, fret: 6, role: "other" },
        { string: 2, fret: 2, role: "other" },
        { string: 2, fret: 4, role: "minorTonic" },
        { string: 2, fret: 6, role: "other" },
        { string: 3, fret: 1, role: "other" },
        { string: 3, fret: 3, role: "other" },
        { string: 3, fret: 4, role: "other" },
        { string: 4, fret: 1, role: "minorTonic" },
        { string: 4, fret: 3, role: "other" },
        { string: 4, fret: 4, role: "majorTonic" },
        { string: 5, fret: 1, role: "other" },
        { string: 5, fret: 2, role: "other" },
        { string: 5, fret: 4, role: "other" },
        { string: 6, fret: 1, role: "other" },
        { string: 6, fret: 2, role: "majorTonic" },
        { string: 6, fret: 4, role: "other" }
      ]
    }
  ];

  return { boxes: boxes };
});
