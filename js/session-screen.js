/*
 * Секундомер занятия на экране "Метроном".
 *
 * Сессия: НАЧАТЬ СЕССИЮ -> (НОВЫЙ ЭТАП)* -> СТОП. Паузы нет намеренно: перерыв =
 * стоп и потом новая сессия. Этапы — просто безымянные отрезки времени
 * внутри сессии (подходит любому инструменту/занятию).
 *
 * Время считается от меток Date.now(), а не тиканьем, и незавершённая
 * сессия лежит в localStorage — так она переживает сон iPad и выгрузку
 * PWA из памяти.
 *
 * Средний темп — взвешенный по времени, когда метроном реально играл
 * (10 мин на 60 + 5 мин на 90 = 70). Отрезки игры метронома ловим по
 * событию "gp:metronome" из rhythm-screen.js.
 *
 * По СТОП сессия уходит в историю (history-screen.js).
 */
(function () {
  "use strict";

  var SESSION_KEY = "gp:session";

  var totalEl = document.getElementById("sessionTotal");
  var stageTimeEl = document.getElementById("stageTime");
  var stageLabelEl = document.getElementById("stageLabel");
  var stageListEl = document.getElementById("stageList");
  var startBtn = document.getElementById("sessionStart");
  var stageBtn = document.getElementById("sessionStage");
  var stopBtn = document.getElementById("sessionStop");

  // session: { start, stages: [метки начала этапов], tempoMs, tempoSum,
  //            seg: { from, bpm } | null — метроном играет прямо сейчас,
  //            lastTick }
  var session = null;
  // последняя завершённая сессия — её цифры остаются на экране до нового старта
  var finished = null;
  var ticker = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function formatTotal(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 3600) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
  }

  function formatStage(ms) {
    var s = Math.floor(ms / 1000);
    if (s >= 3600) return formatTotal(ms);
    return pad(Math.floor(s / 60)) + ":" + pad(s % 60);
  }

  function save() {
    session.lastTick = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function closeSegment(at) {
    if (!session.seg) return;
    var dur = Math.max(0, at - session.seg.from);
    session.tempoMs += dur;
    session.tempoSum += dur * session.seg.bpm;
    session.seg = null;
  }

  function openSegmentIfPlaying(at) {
    var m = window.gpMetronome;
    if (m && m.playing) session.seg = { from: at, bpm: m.bpm };
  }

  function stageDurations(stages, end) {
    return stages.map(function (from, i) {
      var to = i + 1 < stages.length ? stages[i + 1] : end;
      return to - from;
    });
  }

  function render() {
    var src = session || finished;
    var running = !!session;

    startBtn.hidden = running;
    stageBtn.hidden = !running;
    stopBtn.hidden = !running;

    if (!src) {
      totalEl.textContent = formatTotal(0);
      stageTimeEl.textContent = formatStage(0);
      stageLabelEl.textContent = "Этап";
      stageListEl.innerHTML = "";
      return;
    }

    var end = running ? Date.now() : src.end;
    var durations = stageDurations(src.stages, end);

    totalEl.textContent = formatTotal(end - src.start);
    stageTimeEl.textContent = formatStage(durations[durations.length - 1]);
    stageLabelEl.textContent = "Этап " + durations.length;

    stageListEl.innerHTML = durations.map(function (d, i) {
      var current = running && i === durations.length - 1;
      return '<span class="stage-chip' + (current ? " current" : "") + '">' +
        '<span class="stage-num">' + (i + 1) + "</span>" + formatStage(d) + "</span>";
    }).join("");
  }

  function tick() {
    // lastTick нужен только чтобы корректно закрыть отрезок метронома
    // после выгрузки приложения — пишем, пока метроном играет
    if (session.seg) save();
    render();
  }

  function startTicker() {
    clearInterval(ticker);
    ticker = setInterval(tick, 1000);
  }

  function start() {
    var t = Date.now();
    session = { start: t, stages: [t], tempoMs: 0, tempoSum: 0, seg: null };
    finished = null;
    openSegmentIfPlaying(t);
    save();
    startTicker();
    render();
  }

  function newStage() {
    session.stages.push(Date.now());
    save();
    render();
  }

  function stop() {
    var t = Date.now();
    closeSegment(t);
    var record = {
      start: session.start,
      end: t,
      durationMs: t - session.start,
      avgBpm: session.tempoMs > 0 ? Math.round(session.tempoSum / session.tempoMs) : null,
      stages: stageDurations(session.stages, t)
    };
    window.gpHistory.add(record);

    finished = { start: session.start, end: t, stages: session.stages };
    session = null;
    localStorage.removeItem(SESSION_KEY);
    clearInterval(ticker);
    render();
  }

  document.addEventListener("gp:metronome", function () {
    if (!session) return;
    var t = Date.now();
    closeSegment(t);
    openSegmentIfPlaying(t);
    save();
  });

  startBtn.addEventListener("click", start);
  stageBtn.addEventListener("click", newStage);
  stopBtn.addEventListener("click", stop);

  // Восстановление незавершённой сессии после перезапуска приложения.
  // Метроном после перезапуска молчит, поэтому открытый отрезок его игры
  // закрываем на последнем известном тике.
  try {
    session = JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    session = null;
  }
  if (session) {
    closeSegment(session.lastTick || Date.now());
    openSegmentIfPlaying(Date.now());
    save();
    startTicker();
  }
  render();
})();
