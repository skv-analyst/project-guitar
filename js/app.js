(function () {
  "use strict";

  var tabs = document.querySelectorAll(".tab");
  var screens = document.querySelectorAll(".screen");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-screen");

      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle("active", active);
        t.setAttribute("aria-selected", String(active));
      });

      screens.forEach(function (s) {
        s.classList.toggle("active", s.id === "screen-" + target);
      });
      // Метроном намеренно продолжает играть при переключении вкладок —
      // так можно уйти на экран боксов/CAGED, не сбивая темп.
    });
  });
})();
