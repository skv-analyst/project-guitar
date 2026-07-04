/*
 * Секвенции — просто наборы чисел (степени/номера нот бокса по порядку) с
 * названием паттерна. Реальный список наполняешь сам — здесь только ОДИН
 * пример-заглушка для проверки экрана, помеченный явно как placeholder.
 * Формат: { id, name, numbers: [...] }
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
    {
      id: "example-1-2-3-4",
      name: "Пример (заглушка) — 1-2-3-4",
      numbers: [1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6, 4, 5, 6, 7]
    }
  ];

  return { sequences: sequences };
});
