/*
 * Экран "История" — лог завершённых сессий секундомера (session-screen.js).
 *
 * Хранится в localStorage этого устройства. На iPad эти данные стираются
 * вместе с удалением PWA с экрана "Домой", поэтому есть экспорт/импорт
 * в JSON-файл (на iPad — через меню "Поделиться" -> "Сохранить в Файлы",
 * то есть в iCloud Drive). Импорт сливает записи с уже имеющимися, дубли
 * (по времени начала) пропускает.
 *
 * Запись: { start, end, durationMs, avgBpm | null, stages: [мс этапов] }.
 */
(function () {
  "use strict";

  var HISTORY_KEY = "gp:history";

  var bodyEl = document.getElementById("historyBody");
  var emptyEl = document.getElementById("historyEmpty");
  var exportBtn = document.getElementById("exportBtn");
  var importBtn = document.getElementById("importBtn");
  var importInput = document.getElementById("importInput");

  function load() {
    try {
      var list = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  var sessions = load();

  function persist() {
    sessions.sort(function (a, b) { return b.start - a.start; });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function formatDate(ms) {
    var d = new Date(ms);
    return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear();
  }

  function formatClock(ms) {
    var d = new Date(ms);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function formatDuration(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 3600) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
  }

  function render() {
    emptyEl.hidden = sessions.length > 0;
    bodyEl.innerHTML = sessions.map(function (s) {
      return "<tr>" +
        "<td>" + formatDate(s.start) + "</td>" +
        '<td class="mono">' + formatClock(s.start) + "</td>" +
        '<td class="mono">' + formatClock(s.end) + "</td>" +
        '<td class="mono">' + formatDuration(s.durationMs) + "</td>" +
        '<td class="mono">' + (s.avgBpm ? s.avgBpm + " BPM" : "—") + "</td>" +
        "</tr>";
    }).join("");
  }

  function isValid(s) {
    return s && typeof s.start === "number" && typeof s.end === "number" &&
      typeof s.durationMs === "number";
  }

  function exportHistory() {
    var json = JSON.stringify({ app: "guitar-practice", version: 1, sessions: sessions }, null, 2);
    var name = "guitar-practice-history-" + formatDate(Date.now()).split(".").reverse().join("-") + ".json";
    var file = new File([json], name, { type: "application/json" });

    // На iPad файл в режиме PWA по ссылке не скачать — отдаём через
    // системное меню "Поделиться", там есть "Сохранить в Файлы".
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file] }).catch(function () {});
      return;
    }
    var a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importHistory(file) {
    var reader = new FileReader();
    reader.onload = function () {
      var incoming;
      try {
        var data = JSON.parse(reader.result);
        incoming = Array.isArray(data) ? data : data.sessions;
      } catch (e) {
        incoming = null;
      }
      if (!Array.isArray(incoming)) {
        alert("Не получилось прочитать файл — это точно экспорт истории?");
        return;
      }
      var known = {};
      sessions.forEach(function (s) { known[s.start] = true; });
      var added = 0;
      incoming.filter(isValid).forEach(function (s) {
        if (known[s.start]) return;
        known[s.start] = true;
        sessions.push(s);
        added++;
      });
      persist();
      render();
      alert("Добавлено сессий: " + added);
    };
    reader.readAsText(file);
  }

  exportBtn.addEventListener("click", exportHistory);
  importBtn.addEventListener("click", function () { importInput.click(); });
  importInput.addEventListener("change", function () {
    if (importInput.files[0]) importHistory(importInput.files[0]);
    importInput.value = "";
  });

  window.gpHistory = {
    add: function (record) {
      sessions.push(record);
      persist();
      render();
    }
  };

  render();
})();
