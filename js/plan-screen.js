/*
 * Экран "План" — секундомер занятия + 21-дневный план с отметками о
 * выполнении, перенесено из fretflow-plan-screen.html. В отличие от
 * референса, отметки и накопленное время занятий сохраняются в localStorage
 * (референс держал это только в памяти JS и терял при перезагрузке) —
 * приложение офлайновое, PWA, поэтому это должно переживать перезагрузку.
 */
(function () {
  "use strict";

  var PROGRESS_KEY = "fretflow-plan-progress";
  var TOTAL_SECONDS_KEY = "fretflow-plan-total-seconds";

  var PLAN = window.PlanData.plan;

  var planListEl = document.getElementById("planList");
  var doneCountEl = document.getElementById("doneCount");
  var timerDisplayEl = document.getElementById("timerDisplay");
  var timerStartBtn = document.getElementById("timerStart");
  var timerResetBtn = document.getElementById("timerReset");
  var totalTimeEl = document.getElementById("totalTime");

  function loadDoneDays() {
    try {
      var raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
      return new Set(raw);
    } catch (e) {
      return new Set();
    }
  }

  function saveDoneDays(doneDays) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(doneDays)));
  }

  var doneDays = loadDoneDays();

  function linksHTML(links) {
    if (!links || links.length === 0) return "";
    return links.map(function (l) {
      return ' <a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + '</a>';
    }).join(" ·");
  }

  function renderPlan() {
    planListEl.innerHTML = "";
    var currentWeek = 0;

    PLAN.forEach(function (d) {
      if (d.week !== currentWeek) {
        currentWeek = d.week;
        var label = document.createElement("div");
        label.className = "week-label";
        label.textContent = "Неделя " + currentWeek;
        planListEl.appendChild(label);
      }

      var card = document.createElement("div");
      card.className = "day-card" + (doneDays.has(d.day) ? " done" : "");

      var header = document.createElement("button");
      header.className = "day-header";
      header.innerHTML =
        '<span class="day-check"><input type="checkbox" ' + (doneDays.has(d.day) ? "checked" : "") + ' data-day="' + d.day + '"></span>' +
        '<span class="day-num mono">День ' + d.day + "</span>" +
        '<span class="day-teaser">' + d.teaser + "</span>" +
        '<span class="day-chevron">▾</span>';
      header.addEventListener("click", function (e) {
        if (e.target.tagName === "INPUT") return;
        card.classList.toggle("open");
      });

      var checkbox = header.querySelector("input");
      checkbox.addEventListener("click", function (e) {
        e.stopPropagation();
        if (checkbox.checked) doneDays.add(d.day);
        else doneDays.delete(d.day);
        card.classList.toggle("done", checkbox.checked);
        doneCountEl.textContent = String(doneDays.size);
        saveDoneDays(doneDays);
      });

      var body = document.createElement("div");
      body.className = "day-body";
      body.innerHTML =
        '<span class="block-label">Утро · 45 мин</span>' +
        '<p class="block-text">' + d.morning + linksHTML(d.morningLinks) + "</p>" +
        (d.morningNote ? '<div class="block-note">' + d.morningNote + "</div>" : "") +
        '<span class="block-label">Днём · 15–20 мин</span>' +
        '<p class="block-text">' + d.midday + "</p>" +
        '<div class="day-result">«' + d.result + "»</div>";

      card.appendChild(header);
      card.appendChild(body);
      planListEl.appendChild(card);
    });
  }

  doneCountEl.textContent = String(doneDays.size);
  renderPlan();

  // ---------- секундомер занятия (считает вверх) + накопленное время ----------
  var timerSeconds = 0;
  var timerRunning = false;
  var timerInterval = null;
  var totalSeconds = parseInt(localStorage.getItem(TOTAL_SECONDS_KEY), 10) || 0;

  function formatTime(total) {
    var h = String(Math.floor(total / 3600)).padStart(2, "0");
    var m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    var s = String(total % 60).padStart(2, "0");
    return h + ":" + m + ":" + s;
  }

  function formatTotal(total) {
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    return "Всего позанимался: " + h + " ч " + m + " мин";
  }

  function renderTotal() {
    if (totalTimeEl) totalTimeEl.textContent = formatTotal(totalSeconds);
  }

  timerDisplayEl.textContent = formatTime(0);
  renderTotal();

  timerStartBtn.addEventListener("click", function () {
    timerRunning = !timerRunning;
    timerStartBtn.textContent = timerRunning ? "Пауза" : "Старт";
    timerStartBtn.classList.toggle("running", timerRunning);
    if (timerRunning) {
      timerInterval = setInterval(function () {
        timerSeconds++;
        totalSeconds++;
        timerDisplayEl.textContent = formatTime(timerSeconds);
        renderTotal();
        localStorage.setItem(TOTAL_SECONDS_KEY, String(totalSeconds));
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
  });

  timerResetBtn.addEventListener("click", function () {
    timerRunning = false;
    clearInterval(timerInterval);
    timerSeconds = 0;
    timerDisplayEl.textContent = formatTime(0);
    timerStartBtn.textContent = "Старт";
    timerStartBtn.classList.remove("running");
  });
})();
