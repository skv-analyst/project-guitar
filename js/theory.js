/*
 * Табличная транспонизация аккордовых последовательностей (см. бриф).
 * Никаких "придуманных на глаз" аккордов — только фиксированная формула
 * ступеней major/natural-minor, сдвинутая на нужное число полутонов.
 * Проверяется unit-тестами в tests/theory.test.js на известных тональностях.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.Theory = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

  // Формула ступеней мажора (интервалы в полутонах от тоники + качество трезвучия).
  var MAJOR_FORMULA = [
    { interval: 0, quality: "maj" },
    { interval: 2, quality: "min" },
    { interval: 4, quality: "min" },
    { interval: 5, quality: "maj" },
    { interval: 7, quality: "maj" },
    { interval: 9, quality: "min" },
    { interval: 11, quality: "dim" }
  ];

  // Формула ступеней натурального минора.
  var MINOR_FORMULA = [
    { interval: 0, quality: "min" },
    { interval: 2, quality: "dim" },
    { interval: 3, quality: "maj" },
    { interval: 5, quality: "min" },
    { interval: 7, quality: "min" },
    { interval: 8, quality: "maj" },
    { interval: 10, quality: "maj" }
  ];

  var ROMAN_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  var ROMAN_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

  var QUALITY_SUFFIX = { maj: "", min: "m", dim: "dim" };

  // Круг квинт (мажорные тональности), по часовой стрелке от C.
  var CIRCLE_MAJOR = [
    { name: "C", pc: 0, minorName: "Am", flats: false },
    { name: "G", pc: 7, minorName: "Em", flats: false },
    { name: "D", pc: 2, minorName: "Bm", flats: false },
    { name: "A", pc: 9, minorName: "F#m", flats: false },
    { name: "E", pc: 4, minorName: "C#m", flats: false },
    { name: "B", pc: 11, minorName: "G#m", flats: false },
    { name: "Gb", pc: 6, minorName: "Ebm", flats: true },
    { name: "Db", pc: 1, minorName: "Bbm", flats: true },
    { name: "Ab", pc: 8, minorName: "Fm", flats: true },
    { name: "Eb", pc: 3, minorName: "Cm", flats: true },
    { name: "Bb", pc: 10, minorName: "Gm", flats: true },
    { name: "F", pc: 5, minorName: "Dm", flats: true }
  ];

  function pcOf(n) {
    return ((n % 12) + 12) % 12;
  }

  function noteName(pc, useFlats) {
    pc = pcOf(pc);
    return useFlats ? FLAT_NAMES[pc] : SHARP_NAMES[pc];
  }

  /**
   * Диатонические трезвучия тональности, построенные табличным сдвигом
   * фиксированной формулы ступеней — не генерацией "по наитию".
   * @param {number} rootPc - тоника, 0=C .. 11=B
   * @param {"major"|"minor"} mode
   * @param {boolean} [useFlats]
   */
  function diatonicChords(rootPc, mode, useFlats) {
    var formula = mode === "minor" ? MINOR_FORMULA : MAJOR_FORMULA;
    var romans = mode === "minor" ? ROMAN_MINOR : ROMAN_MAJOR;
    return formula.map(function (step, i) {
      var pc = pcOf(rootPc + step.interval);
      var name = noteName(pc, useFlats);
      return {
        root: name,
        pc: pc,
        quality: step.quality,
        roman: romans[i],
        name: name + QUALITY_SUFFIX[step.quality]
      };
    });
  }

  return {
    SHARP_NAMES: SHARP_NAMES,
    FLAT_NAMES: FLAT_NAMES,
    CIRCLE_MAJOR: CIRCLE_MAJOR,
    pcOf: pcOf,
    noteName: noteName,
    diatonicChords: diatonicChords
  };
});
