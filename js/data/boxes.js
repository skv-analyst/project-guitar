/*
 * 7 боксов лада (3-notes-per-string система) — не считываются с картинки,
 * а ВЫЧИСЛЯЮТСЯ из формулы мажорной гаммы + стандартного строя, точно тем
 * же табличным/детерминированным способом, что и транспонизация аккордов
 * в js/theory.js. Верно для любой из 7 позиций сразу, без ручной оцифровки
 * и без риска опечататься в ладу/струне.
 *
 * Идея:
 *  - На каждой струне ноты гаммы идут по возрастанию лада в ТОМ ЖЕ порядке,
 *    что и ступени гаммы (т.к. интервалы мажорной гаммы уже отсортированы).
 *  - Каждый бокс — это "окно" из 3 ступеней подряд на каждой струне;
 *    от бокса к боксу окно сдвигается на 1 ступень дальше по грифу.
 *  - Между соседними струнами окно дополнительно сдвинуто на 3 ступени
 *    (стандартный сдвиг 3nps-системы; на паре G-B, где строй не на кварту,
 *    а на терцию, поправка возникает сама — за счёт неравномерных шагов
 *    мажорной гаммы, без специального случая в коде).
 *  - Тоника мажора = ступень 1, тоника (относительного) минора = ступень 6.
 *
 * Проверено на BOX 1: результат формулы совпадает нота в ноту с тем, что
 * было вручную оцифровано и подтверждено по исходным скриншотам аппликатур.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.BoxesData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]; // полутона ступеней 1..7 от тоники
  // Струны S6..S1 (низкое E .. высокое e), накопленные полутона от S6
  // при стандартном строе (интервалы между струнами: 5,5,5,4,5 полутонов).
  var STRING_OFFSETS = [0, 5, 10, 15, 19, 24];
  var MODE_NAMES = ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"];
  var MODE_TITLES = [
    "Ионийский бокс", "Дорийский бокс", "Фригийский бокс", "Лидийский бокс",
    "Миксолидийский бокс", "Эолийский бокс", "Локрийский бокс"
  ];

  function scaleToneList(stringIndex, upToFret) {
    var list = [];
    for (var f = 0; f < upToFret; f++) {
      var pc = (STRING_OFFSETS[stringIndex] + f) % 12;
      var degree = MAJOR_STEPS.indexOf(pc);
      if (degree !== -1) list.push({ fret: f, degree: degree });
    }
    return list;
  }

  function roleForDegree(degree) {
    if (degree === 0) return "majorTonic";
    if (degree === 5) return "minorTonic";
    return "other";
  }

  function generateBoxes() {
    var stringLists = [];
    var startIndex = [];
    for (var i = 0; i < 6; i++) {
      stringLists[i] = scaleToneList(i, 30);
      var shift = (3 * i) % 7; // сдвиг окна на этой струне относительно box 0
      startIndex[i] = stringLists[i].map(function (e) { return e.degree; }).indexOf(shift);
    }

    var boxes = [];
    for (var b = 0; b < 7; b++) {
      var notes = [];
      for (var s = 0; s < 6; s++) {
        var window = stringLists[s].slice(startIndex[s] + b, startIndex[s] + b + 3);
        window.forEach(function (entry) {
          notes.push({
            string: 6 - s, // string index0=S6(низкое E) -> string номер 6
            fret: entry.fret + 1, // отображаем с 1, а не с открытой струны
            role: roleForDegree(entry.degree)
          });
        });
      }
      boxes.push({
        id: b + 1,
        mode: MODE_NAMES[b],
        title: MODE_TITLES[b],
        notes: notes
      });
    }
    return boxes;
  }

  return { boxes: generateBoxes() };
});
