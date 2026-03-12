/* --- GLOBAL STATE: Declared at the top to prevent ReferenceErrors --- */
let stopwatchInterval = null;
let timeLeft = 0;
let totalTime = 0;

/**
 * Initialize the visual state of the stopwatch
 */
function initStopwatch() {
  console.log("Stopwatch Module Initialized");
  drawTimerFrame(1); // Draw full ring
}

/**
 * Triggered by the START MISSION button
 */
function startTimer() {
  // 1. Get values from the Dial inputs
  const hh = parseInt(document.getElementById("hDial").value) || 0;
  const mm = parseInt(document.getElementById("mDial").value) || 0;
  const ss = parseInt(document.getElementById("sDial").value) || 0;

  // 2. Calculate total seconds
  timeLeft = hh * 3600 + mm * 60 + ss;
  totalTime = timeLeft;

  // 3. Prevent starting at zero
  if (timeLeft <= 0) {
    return;
  }

  // 4. Request notification permissions
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // 5. Send delay to Service Worker (for background notification if tab closes)
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      action: "SET_TIMER",
      delay: timeLeft * 1000,
    });
  }

  // 6. CLEAR existing interval before starting a new one (This was the error line)
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
  }

  stopwatchInterval = setInterval(tick, 1000);

  // Immediate UI update
  updateTimerUI();
}

/**
 * Countdown logic
 */
function tick() {
  if (timeLeft <= 0) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    return;
  }
  timeLeft--;
  updateTimerUI();
}

/**
 * UI Update for Digital Text and Canvas Ring
 */
function updateTimerUI() {
  const h = Math.floor(timeLeft / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((timeLeft % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");

  const display = document.getElementById("digitalTimer");
  if (display) display.innerText = `${h}:${m}:${s}`;

  const progress = totalTime > 0 ? timeLeft / totalTime : 1;
  drawTimerFrame(progress);
}

/**
 * Purple Glow Ring Drawing
 */
function drawTimerFrame(percent) {
  const canvas = document.getElementById("timerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = 160;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = "#1a1a24";
  ctx.lineWidth = 15;
  ctx.stroke();

  // Purple Progress
  if (percent > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percent);
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#a855f7";
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

/**
 * Reset all values
 */
function resetTimer() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  }
  timeLeft = 0;
  totalTime = 0;

  document.getElementById("hDial").value = 0;
  document.getElementById("mDial").value = 0;
  document.getElementById("sDial").value = 0;
  document.getElementById("digitalTimer").innerText = "00:00:00";
  drawTimerFrame(1);
}
