// Локальный раннер для проверки js/theory.js через jsc (JavaScriptCore),
// т.к. в этом окружении нет установленного Node. В окружении с Node
// используйте `node tests/theory.test.js` — та же логика проверок.
"use strict";

var failures = 0;
var passed = 0;

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function test(name, fn) {
  try {
    fn();
    passed++;
    print("  ok - " + name);
  } catch (err) {
    failures++;
    print("  FAIL - " + name);
    print("    " + err);
  }
}

function chordNames(chords) {
  return chords.map(function (c) { return c.name; });
}

function assertEqual(actual, expected, label) {
  if (!arraysEqual(actual, expected)) {
    throw new Error(
      (label || "") + " expected [" + expected.join(", ") + "] got [" + actual.join(", ") + "]"
    );
  }
}

test("C major diatonic chords: C Dm Em F G Am Bdim", function () {
  var chords = Theory.diatonicChords(0, "major", false);
  assertEqual(chordNames(chords), ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
});

test("A natural minor diatonic chords: Am Bdim C Dm Em F G", function () {
  var chords = Theory.diatonicChords(9, "minor", false);
  assertEqual(chordNames(chords), ["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
});

test("G major diatonic chords: G Am Bm C D Em F#dim", function () {
  var chords = Theory.diatonicChords(7, "major", false);
  assertEqual(chordNames(chords), ["G", "Am", "Bm", "C", "D", "Em", "F#dim"]);
});

test("E natural minor diatonic chords: Em F#dim G Am Bm C D", function () {
  var chords = Theory.diatonicChords(4, "minor", false);
  assertEqual(chordNames(chords), ["Em", "F#dim", "G", "Am", "Bm", "C", "D"]);
});

test("F major diatonic chords use flats when requested: F Gm Am Bb C Dm Edim", function () {
  var chords = Theory.diatonicChords(5, "major", true);
  assertEqual(chordNames(chords), ["F", "Gm", "Am", "Bb", "C", "Dm", "Edim"]);
});

test("roman numerals match major/minor scale-degree conventions", function () {
  var major = Theory.diatonicChords(0, "major", false);
  assertEqual(major.map(function (c) { return c.roman; }), ["I", "ii", "iii", "IV", "V", "vi", "vii°"]);

  var minor = Theory.diatonicChords(9, "minor", false);
  assertEqual(minor.map(function (c) { return c.roman; }), ["i", "ii°", "III", "iv", "v", "VI", "VII"]);
});

print(passed + " passed, " + failures + " failed");
