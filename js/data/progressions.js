/*
 * Аккордовые прогрессии для экрана "Гриф" — набор общеизвестных, устоявшихся
 * схем (не наш выбор), заданы ступенями гаммы (1-based). Перенесено как есть
 * из fretflow-fretboard-screen.html: одна и та же прогрессия используется и
 * для dur, и для moll — конкретный аккорд на каждой ступени считает
 * js/theory.js (Theory.diatonicChords) под текущий mode.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.ProgressionsData = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var progressions = [
    { label: "I – V – vi – IV", degrees: [1, 5, 6, 4] },
    { label: "I – vi – IV – V", degrees: [1, 6, 4, 5] },
    { label: "vi – IV – I – V", degrees: [6, 4, 1, 5] },
    { label: "ii – V – I – vi", degrees: [2, 5, 1, 6] }
  ];

  return { progressions: progressions };
});
