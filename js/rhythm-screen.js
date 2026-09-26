/*
 * Экран "Метроном" — метроном + сетка такта из 16 ячеек (16-я длительность —
 * минимальная единица), на которой подсвечиваются доли в такт кликам.
 *
 * Такт всегда 4 доли; переключатель "signature" — это не размер такта,
 * а разрешение клика метронома внутри доли: 4/4 = клик на каждую долю,
 * 4/8 = клик на каждую восьмую, 4/16 = клик на каждую шестнадцатую.
 * Подсветка закрашивает те ячейки сетки, что приходятся на текущий клик.
 *
 * Метроном намеренно продолжает играть при переключении вкладок (как и
 * раньше) — экраны скрываются через CSS display:none, а не удаляются из
 * DOM, поэтому таймеры планировщика не прерываются.
 */
(function () {
  "use strict";

  var bpmValueEl = document.getElementById("bpmValue");
  var startBtn = document.getElementById("startBtn");
  var tapBtn = document.getElementById("tapBtn");
  var accentSwitchEl = document.getElementById("accentSwitch");
  var hlLayerEl = document.getElementById("hlLayer");
  var barTableEl = document.getElementById("barTable");

  function renderBar() {
    hlLayerEl.innerHTML = "";
    for (var s = 0; s < 16; s++) {
      var slot = document.createElement("div");
      slot.className = "hl-slot";
      hlLayerEl.appendChild(slot);
    }

    barTableEl.querySelectorAll(".beat-divider").forEach(function (el) { el.remove(); });
    [4, 8, 12].forEach(function (s) {
      var div = document.createElement("div");
      div.className = "beat-divider";
      div.style.left = (s / 16 * 100) + "%";
      barTableEl.appendChild(div);
    });
  }

  // ---------- metronome state ----------
  var bpm = 70;
  var playing = false;
  var audioCtx = null;
  var nextNoteTime = 0;
  var currentClick = 0;
  var schedulerTimer = null;
  var accentFirst = true;
  var signature = "4/4";
  var SLOTS_PER_BEAT = { "4/4": 1, "4/8": 2, "4/16": 4 };

  var LOOKAHEAD = 25;
  var SCHEDULE_AHEAD = 0.1;

  function totalClicks() { return 4 * SLOTS_PER_BEAT[signature]; }
  function secondsPerClick() { return (60 / bpm) / SLOTS_PER_BEAT[signature]; }

  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function playClick(time, isAccent) {
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.frequency.value = isAccent ? 1400 : 900;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(isAccent ? 0.25 : 0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.start(time);
    osc.stop(time + 0.07);
  }

  function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD) {
      var isAccent = accentFirst && currentClick === 0;
      playClick(nextNoteTime, isAccent);
      var clickIndex = currentClick;
      var delay = (nextNoteTime - audioCtx.currentTime) * 1000;
      setTimeout(function () { highlightClick(clickIndex); }, Math.max(0, delay));

      nextNoteTime += secondsPerClick();
      currentClick = (currentClick + 1) % totalClicks();
    }
    schedulerTimer = setTimeout(scheduler, LOOKAHEAD);
  }

  function highlightClick(clickIndex) {
    var slotsPerBeat = SLOTS_PER_BEAT[signature];
    var span = 4 / slotsPerBeat;
    var firstGlobalSlot = clickIndex * span;

    var slots = hlLayerEl.querySelectorAll(".hl-slot");
    slots.forEach(function (s) { s.classList.remove("active"); });
    for (var s = firstGlobalSlot; s < firstGlobalSlot + span; s++) {
      if (slots[s]) slots[s].classList.add("active");
    }

    bpmValueEl.classList.add("pulse");
    setTimeout(function () { bpmValueEl.classList.remove("pulse"); }, 90);
  }

  function clearHighlight() {
    hlLayerEl.querySelectorAll(".hl-slot").forEach(function (s) { s.classList.remove("active"); });
  }

  function setBpm(value) {
    bpm = Math.min(240, Math.max(30, value));
    bpmValueEl.textContent = String(bpm);
    localStorage.setItem("gp:bpm", String(bpm));
  }

  function startStop() {
    ensureAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    playing = !playing;
    if (playing) {
      startBtn.textContent = "СТОП";
      startBtn.classList.add("playing");
      currentClick = 0;
      nextNoteTime = audioCtx.currentTime + 0.05;
      scheduler();
    } else {
      startBtn.textContent = "СТАРТ";
      startBtn.classList.remove("playing");
      clearTimeout(schedulerTimer);
      clearHighlight();
    }
  }

  var tapTimes = [];
  function tapTempo() {
    var now = performance.now();
    tapTimes.push(now);
    tapTimes = tapTimes.filter(function (t) { return now - t < 2500; });
    if (tapTimes.length >= 2) {
      var intervals = [];
      for (var i = 1; i < tapTimes.length; i++) intervals.push(tapTimes[i] - tapTimes[i - 1]);
      var avg = intervals.reduce(function (a, b) { return a + b; }, 0) / intervals.length;
      setBpm(Math.round(60000 / avg));
    }
  }

  document.querySelectorAll(".bpm-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setBpm(bpm + Number(btn.dataset.delta));
    });
  });

  document.querySelectorAll(".signature-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      signature = btn.dataset.sig;
      document.querySelectorAll(".signature-btn").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      currentClick = 0;
      clearHighlight();
      localStorage.setItem("gp:signature", signature);
    });
  });

  startBtn.addEventListener("click", startStop);
  tapBtn.addEventListener("click", tapTempo);
  accentSwitchEl.addEventListener("click", function () {
    accentFirst = !accentFirst;
    accentSwitchEl.classList.toggle("on", accentFirst);
    localStorage.setItem("gp:accent", accentFirst ? "1" : "0");
  });

  // Restore last-used settings (persistence, как и раньше у метронома).
  var savedBpm = parseInt(localStorage.getItem("gp:bpm"), 10);
  setBpm(isNaN(savedBpm) ? bpm : savedBpm);

  var savedSignature = localStorage.getItem("gp:signature");
  if (savedSignature && SLOTS_PER_BEAT[savedSignature]) {
    signature = savedSignature;
    document.querySelectorAll(".signature-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.sig === signature);
    });
  }

  var savedAccent = localStorage.getItem("gp:accent");
  if (savedAccent !== null) {
    accentFirst = savedAccent === "1";
    accentSwitchEl.classList.toggle("on", accentFirst);
  }

  renderBar();
})();
