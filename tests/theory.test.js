/*
 * Проверка табличной транспонизации на тональностях, известных наизусть
 * (см. бриф): C-мажор и A-минор — плюс G-мажор/E-минор для проверки
 * работы с диезами. Если эти тесты зелёные, значит формула сдвига верна
 * и остальные 10 тональностей корректны автоматически (это один и тот
 * же табличный сдвиг, не отдельная генерация под каждую тональность).
 *
 * Запуск: node tests/theory.test.js
 */
"use strict";

var assert = require("assert");
var Theory = require("../js/theory.js");

var failures = 0;
var passed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok - " + name);
  } catch (err) {
    failures++;
    console.error("  FAIL - " + name);
    console.error("    " + err.message);
  }
}

function chordNames(chords) {
  return chords.map(function (c) {
    return c.name;
  });
}

test("C major diatonic chords: C Dm Em F G Am Bdim", function () {
  var chords = Theory.diatonicChords(0, "major", false);
  assert.deepStrictEqual(chordNames(chords), ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
});

test("A natural minor diatonic chords: Am Bdim C Dm Em F G", function () {
  var chords = Theory.diatonicChords(9, "minor", false);
  assert.deepStrictEqual(chordNames(chords), ["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
});

test("G major diatonic chords: G Am Bm C D Em F#dim", function () {
  var chords = Theory.diatonicChords(7, "major", false);
  assert.deepStrictEqual(chordNames(chords), ["G", "Am", "Bm", "C", "D", "Em", "F#dim"]);
});

test("E natural minor diatonic chords: Em F#dim G Am Bm C D", function () {
  var chords = Theory.diatonicChords(4, "minor", false);
  assert.deepStrictEqual(chordNames(chords), ["Em", "F#dim", "G", "Am", "Bm", "C", "D"]);
});

test("F major diatonic chords use flats when requested: F Gm Am Bb C Dm Edim", function () {
  var chords = Theory.diatonicChords(5, "major", true);
  assert.deepStrictEqual(chordNames(chords), ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"]);
});

test("roman numerals match major/minor scale-degree conventions", function () {
  var major = Theory.diatonicChords(0, "major", false);
  assert.deepStrictEqual(
    major.map(function (c) { return c.roman; }),
    ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
  );

  var minor = Theory.diatonicChords(9, "minor", false);
  assert.deepStrictEqual(
    minor.map(function (c) { return c.roman; }),
    ["i", "ii°", "III", "iv", "v", "VI", "VII"]
  );
});

console.log(passed + " passed, " + failures + " failed");
process.exit(failures ? 1 : 0);
