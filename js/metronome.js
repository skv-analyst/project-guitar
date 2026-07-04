(function () {
  "use strict";

  // Look-ahead scheduling pattern (avoids setInterval drift): a cheap
  // setInterval only wakes the scheduler up periodically to queue any
  // audio events that fall within the next SCHEDULE_AHEAD_TIME window,
  // but the actual tick times are always taken from AudioContext.currentTime.
  var SCHEDULE_AHEAD_TIME = 0.1; // seconds
  var LOOKAHEAD_INTERVAL = 25; // ms, how often the scheduler wakes up

  var audioCtx = null;
  var isRunning = false;
  var currentBeat = 0;
  var nextNoteTime = 0;
  var schedulerTimer = null;
  var beatsPerBar = 4;
  var bpm = 100;
  var accentEnabled = true;

  var scheduledBeats = []; // {beat, time} queued for visual highlight

  var bpmValueEl = document.getElementById("bpm-value");
  var bpmSliderEl = document.getElementById("bpm-slider");
  var timeSigEl = document.getElementById("time-sig");
  var accentToggleEl = document.getElementById("accent-toggle");
  var toggleBtn = document.getElementById("metronome-toggle");
  var beatLightsEl = document.getElementById("beat-lights");

  function setBpm(value) {
    bpm = Math.min(260, Math.max(30, value));
    bpmValueEl.textContent = String(bpm);
    bpmSliderEl.value = String(bpm);
    localStorage.setItem("gp:bpm", String(bpm));
  }

  function setBeatsPerBar(value) {
    beatsPerBar = value;
    renderBeatLights();
    localStorage.setItem("gp:timeSig", String(value));
  }

  function renderBeatLights() {
    beatLightsEl.innerHTML = "";
    for (var i = 0; i < beatsPerBar; i++) {
      var light = document.createElement("div");
      light.className = "beat-light";
      beatLightsEl.appendChild(light);
    }
  }

  function scheduleNote(beatNumber, time) {
    scheduledBeats.push({ beat: beatNumber, time: time });

    var isAccent = accentEnabled && beatNumber === 0;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    osc.frequency.value = isAccent ? 1500 : 1000;
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  function nextNote() {
    var secondsPerBeat = 60.0 / bpm;
    nextNoteTime += secondsPerBeat;
    currentBeat = (currentBeat + 1) % beatsPerBar;
  }

  function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleNote(currentBeat, nextNoteTime);
      nextNote();
    }
    schedulerTimer = setTimeout(scheduler, LOOKAHEAD_INTERVAL);
    updateVisualBeat();
  }

  function updateVisualBeat() {
    var now = audioCtx.currentTime;
    var lights = beatLightsEl.children;

    while (scheduledBeats.length && scheduledBeats[0].time <= now) {
      var due = scheduledBeats.shift();
      for (var i = 0; i < lights.length; i++) {
        lights[i].classList.remove("on", "accent");
      }
      var light = lights[due.beat];
      if (light) {
        light.classList.add("on");
        if (accentEnabled && due.beat === 0) light.classList.add("accent");
      }
    }
  }

  function start() {
    if (isRunning) return;
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    isRunning = true;
    currentBeat = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;
    scheduledBeats = [];
    scheduler();
    toggleBtn.textContent = "Стоп";
    toggleBtn.classList.add("running");
  }

  function stop() {
    if (!isRunning) return;
    isRunning = false;
    clearTimeout(schedulerTimer);
    scheduledBeats = [];
    for (var i = 0; i < beatLightsEl.children.length; i++) {
      beatLightsEl.children[i].classList.remove("on", "accent");
    }
    toggleBtn.textContent = "Старт";
    toggleBtn.classList.remove("running");
  }

  toggleBtn.addEventListener("click", function () {
    if (isRunning) stop();
    else start();
  });

  bpmSliderEl.addEventListener("input", function () {
    setBpm(parseInt(bpmSliderEl.value, 10));
  });

  document.querySelectorAll(".bpm-step").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setBpm(bpm + parseInt(btn.getAttribute("data-delta"), 10));
    });
  });

  timeSigEl.addEventListener("change", function () {
    setBeatsPerBar(parseInt(timeSigEl.value, 10));
  });

  accentToggleEl.addEventListener("change", function () {
    accentEnabled = accentToggleEl.checked;
  });

  // Restore last-used settings (optional persistence, per brief).
  var savedBpm = parseInt(localStorage.getItem("gp:bpm"), 10);
  if (!isNaN(savedBpm)) setBpm(savedBpm);
  else setBpm(bpm);

  var savedTimeSig = parseInt(localStorage.getItem("gp:timeSig"), 10);
  if (!isNaN(savedTimeSig)) {
    beatsPerBar = savedTimeSig;
    timeSigEl.value = String(savedTimeSig);
  }
  renderBeatLights();

  window.Metronome = { start: start, stop: stop };
})();
