(function () {
  "use strict";

  var displayEl = document.getElementById("stopwatch-display");
  var toggleBtn = document.getElementById("stopwatch-toggle");
  var resetBtn = document.getElementById("stopwatch-reset");

  var running = false;
  var elapsedMs = 0;
  var startedAt = 0;
  var rafId = null;

  function format(ms) {
    var totalSeconds = Math.floor(ms / 1000);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function render() {
    var current = elapsedMs + (running ? performance.now() - startedAt : 0);
    displayEl.textContent = format(current);
    if (running) rafId = requestAnimationFrame(render);
  }

  function start() {
    if (running) return;
    running = true;
    startedAt = performance.now();
    toggleBtn.textContent = "Пауза";
    toggleBtn.classList.add("running");
    render();
  }

  function pause() {
    if (!running) return;
    elapsedMs += performance.now() - startedAt;
    running = false;
    cancelAnimationFrame(rafId);
    toggleBtn.textContent = "Старт";
    toggleBtn.classList.remove("running");
  }

  function reset() {
    running = false;
    cancelAnimationFrame(rafId);
    elapsedMs = 0;
    toggleBtn.textContent = "Старт";
    toggleBtn.classList.remove("running");
    displayEl.textContent = format(0);
  }

  toggleBtn.addEventListener("click", function () {
    if (running) pause();
    else start();
  });

  resetBtn.addEventListener("click", reset);

  displayEl.textContent = format(0);
})();
