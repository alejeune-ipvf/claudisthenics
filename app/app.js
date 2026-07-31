// Claudisthenics app — v0.1
// Screens: Today (session runner entry), Progress, Settings. Runner takes over fullscreen.

const $ = s => document.querySelector(s);
let tab = "today";
let workout = null;          // {steps, i, results:[], prev, startedAt}
let restTimer = null;
let holdTimer = null;
let audioCtx = null;
let wakeLock = null;

// ---------------------------------------------------------------- utilities
function h(html) { const d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
function toast(msg) {
  const t = h(`<div class="toast">${msg}</div>`);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2200);
}
function beep(freq = 880, dur = 0.12) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.15, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  o.start(); o.stop(audioCtx.currentTime + dur);
}
async function acquireWakeLock() {
  try { if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen"); }
  catch { /* not fatal */ }
}
document.addEventListener("visibilitychange", () => {
  if (workout && document.visibilityState === "visible") acquireWakeLock();
});
function targetText(ex) {
  const [lo, hi] = ex.target;
  const unit = ex.type.includes("hold") ? "s" : "reps";
  const side = ex.type.startsWith("side_") ? " / side" : "";
  return `${lo}–${hi} ${unit}${side}`;
}
function level() { return PROGRAM.levels[Store.load().currentLevel]; }

// ---------------------------------------------------------------- runner steps
function buildSteps(lvl) {
  const steps = [{type: "warmup"}];
  PROGRAM.pairs.forEach((pair, pi) => {
    for (let set = 1; set <= PROGRAM.workSets; set++) {
      pair.forEach(track => {
        steps.push({type: "exercise", key: track, ex: lvl.exercises[track],
                    set, block: `Superset ${pi + 1}`});
        steps.push({type: "rest", seconds: PROGRAM.restSeconds});
      });
    }
  });
  for (let round = 1; round <= PROGRAM.coreRounds; round++) {
    lvl.core.forEach(c => {
      steps.push({type: "exercise", key: c.id, ex: c, set: round,
                  block: "Core", isCore: true});
    });
    steps.push({type: "rest", seconds: PROGRAM.coreRestSeconds});
  }
  while (steps[steps.length - 1].type === "rest") steps.pop();
  steps.push({type: "done"});
  return steps;
}

function startWorkout() {
  const lvl = level();
  if (!lvl.playable) { toast("This level has no workout data yet"); return; }
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
  acquireWakeLock();
  workout = { steps: buildSteps(lvl), i: 0, results: [],
              prev: Store.lastFullSession(lvl.id), startedAt: new Date().toISOString() };
  render();
}

function prevValue(step) {
  if (!workout.prev) return null;
  const src = step.isCore ? workout.prev.core : workout.prev.results;
  const arr = src && src[step.key];
  return arr ? arr[step.set - 1] ?? null : null;
}

function aggregate() {
  const out = { results: {}, core: {} };
  for (const r of workout.results) {
    const dst = r.isCore ? out.core : out.results;
    (dst[r.key] = dst[r.key] || [])[r.set - 1] = r.value;
  }
  return out;
}

function finishWorkout(partial) {
  clearInterval(restTimer); clearInterval(holdTimer);
  if (workout.results.length > 0) {
    const agg = aggregate();
    Store.addSession({ date: workout.startedAt, level: level().id,
                       results: agg.results, core: agg.core,
                       ...(partial ? {partial: true} : {}) });
    toast(partial ? "Partial session saved" : "Session saved 💪");
  }
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  workout = null;
  tab = partial ? "today" : "progress";
  render();
}

function advance() {
  clearInterval(restTimer); clearInterval(holdTimer);
  workout.i++;
  render();
}

// ---------------------------------------------------------------- runner UI
function renderWorkout(root) {
  const step = workout.steps[workout.i];
  const quit = `<button class="quit" id="quitBtn">✕</button>`;

  if (step.type === "warmup") {
    root.appendChild(h(`<div class="runner">
      <div class="runner-head"><span class="block-label">Warm-up</span>${quit}</div>
      <h2>5–8 minutes, don't skip it</h2>
      <ul class="warmup">${PROGRAM.warmup.map(w => `<li>${w}</li>`).join("")}</ul>
      <button class="primary big" id="nextBtn">Warmed up — start</button>
    </div>`));
    $("#nextBtn").onclick = advance;

  } else if (step.type === "exercise") {
    const ex = step.ex;
    const isHold = ex.type.includes("hold");
    const prev = prevValue(step);
    const start = prev ?? ex.target[0];
    root.appendChild(h(`<div class="runner">
      <div class="runner-head">
        <span class="block-label">${step.block} · Set ${step.set}/${step.isCore ? PROGRAM.coreRounds : PROGRAM.workSets}</span>${quit}
      </div>
      <h2>${ex.name}</h2>
      <svg class="viz"></svg>
      <p class="cue">${ex.cue || ""}</p>
      <p class="target">Target: <b>${targetText(ex)}</b>${prev !== null ? ` · last time: ${prev}` : ""}</p>
      ${isHold ? `<button class="secondary big" id="holdBtn">▶ Start hold</button>` : ""}
      <div class="stepper">
        <button id="minus">−</button>
        <span id="val">${start}</span><span class="unit">${isHold ? "s" : "reps"}</span>
        <button id="plus">+</button>
      </div>
      <button class="primary big" id="nextBtn">Set done ✓</button>
    </div>`));
    Viz.mount($(".viz"), ex.viz);
    let val = start;
    const show = () => $("#val").textContent = val;
    $("#minus").onclick = () => { val = Math.max(0, val - 1); show(); };
    $("#plus").onclick = () => { val++; show(); };
    if (isHold) {
      let running = false, t0 = 0;
      $("#holdBtn").onclick = () => {
        if (!running) {
          running = true; t0 = Date.now();
          $("#holdBtn").textContent = "0 s — tap to stop";
          holdTimer = setInterval(() => {
            $("#holdBtn").textContent = `${Math.floor((Date.now() - t0) / 1000)} s — tap to stop`;
          }, 250);
        } else {
          running = false; clearInterval(holdTimer);
          val = Math.round((Date.now() - t0) / 1000); show();
          $("#holdBtn").textContent = "▶ Restart hold";
          beep();
        }
      };
    }
    $("#nextBtn").onclick = () => {
      workout.results.push({key: step.key, name: ex.name, type: ex.type,
                            set: step.set, value: val, isCore: !!step.isCore});
      advance();
    };

  } else if (step.type === "rest") {
    const next = workout.steps[workout.i + 1];
    const nextLabel = next && next.type === "exercise"
      ? `Next: ${next.ex.name} — set ${next.set}` : "Next: wrap-up";
    let end = Date.now() + step.seconds * 1000;
    let lastShown = -1;
    root.appendChild(h(`<div class="runner rest">
      <div class="runner-head"><span class="block-label">Rest</span>${quit}</div>
      <div class="count" id="count"></div>
      <p class="target">${nextLabel}</p>
      <div class="row">
        <button class="secondary" id="plus30">+30 s</button>
        <button class="primary" id="skipBtn">Skip ▸</button>
      </div>
    </div>`));
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      $("#count").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      if (left !== lastShown && left <= 3 && left > 0) beep(660);
      lastShown = left;
      if (left <= 0) { beep(990, 0.25); advance(); }
    };
    tick();
    restTimer = setInterval(tick, 200);
    $("#plus30").onclick = () => { end += 30000; tick(); };
    $("#skipBtn").onclick = advance;

  } else { // done
    const agg = aggregate();
    const lvl = level();
    const rows = PROGRAM.tracks.map(t => {
      const ex = lvl.exercises[t];
      const vals = agg.results[t] || [];
      return `<tr><td>${ex.name}</td><td>${vals.join(" · ") || "—"}</td></tr>`;
    }).join("");
    root.appendChild(h(`<div class="runner">
      <div class="runner-head"><span class="block-label">Done 🎉</span></div>
      <h2>Session complete</h2>
      <table class="summary">${rows}</table>
      <button class="primary big" id="saveBtn">Save session</button>
    </div>`));
    $("#saveBtn").onclick = () => finishWorkout(false);
  }

  const q = $("#quitBtn");
  if (q) q.onclick = () => {
    if (confirm("End workout? Sets done so far are saved as a partial session."))
      finishWorkout(true);
  };
}

// ---------------------------------------------------------------- tabs
function renderToday(root) {
  const d = Store.load();
  const lvl = level();
  const week = Store.sessionsThisWeek();
  const dots = [0, 1, 2].map(i => `<span class="dot ${i < week ? "on" : ""}"></span>`).join("");
  const exList = lvl.playable
    ? PROGRAM.tracks.map(t => `<li>${lvl.exercises[t].name} <span class="dim">${targetText(lvl.exercises[t])}</span></li>`).join("")
      + lvl.core.map(c => `<li class="core-li">${c.name} <span class="dim">${targetText(c)}</span></li>`).join("")
    : `<li class="dim">Level not yet wired for workouts — see Settings.</li>`;
  root.appendChild(h(`<div class="pad">
    <div class="level-card">
      <div class="dim">Level ${lvl.id}</div>
      <h1>${lvl.name}</h1>
      ${lvl.minWeeks ? `<div class="dim">minimum ${lvl.minWeeks} weeks — tendons first</div>` : ""}
    </div>
    <div class="week">This week: ${dots} <span class="dim">${week}/3 sessions</span></div>
    <h3>Today's session</h3>
    <ul class="ex-list">${exList}</ul>
    ${lvl.playable ? `<button class="primary big" id="startBtn">Start workout</button>` : ""}
  </div>`));
  const b = $("#startBtn");
  if (b) b.onclick = startWorkout;
}

function renderProgress(root) {
  const d = Store.load();
  const lvl = level();
  const last = Store.lastFullSession(lvl.id);
  let allTop = lvl.playable;
  const bars = lvl.playable ? PROGRAM.tracks.map(t => {
    const ex = lvl.exercises[t];
    const [lo, hi] = ex.target;
    const vals = (last && last.results[t]) || [];
    const have = vals.length > 0;
    const min = have ? Math.min(...vals.filter(v => v != null)) : null;
    const pct = have ? Math.max(0, Math.min(100, Math.round(100 * min / hi))) : 0;
    const top = have && min >= hi;
    if (!top) allTop = false;
    return `<div class="track">
      <div class="track-head"><span>${PROGRAM.trackLabels[t]}</span>
        <span class="dim">${have ? `${min} / ${hi}` : "no data"}${top ? " ✓" : ""}</span></div>
      <div class="bar"><div class="fill ${top ? "top" : ""}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("") : "";
  let weeksIn = 0;
  if (d.levelStartedAt) weeksIn = Math.floor((Date.now() - new Date(d.levelStartedAt)) / 6048e5);
  const timeGate = lvl.minWeeks && weeksIn < lvl.minWeeks;
  const eligible = allTop && !timeGate && lvl.playable;
  const levelRows = PROGRAM.levels.map(L => {
    const cls = L.id < d.currentLevel ? "past" : L.id === d.currentLevel ? "current" : "locked";
    const icon = L.id < d.currentLevel ? "✓" : L.id === d.currentLevel ? "▶" : "🔒";
    return `<div class="lvl-row ${cls}"><span class="icon">${icon}</span>
      <b>L${L.id} — ${L.name}</b>
      <span class="dim">${L.summary ? L.summary.slice(0, 3).join(", ") + "…" : ""}</span></div>`;
  }).join("");
  root.appendChild(h(`<div class="pad">
    <h1>Progress</h1>
    <div class="dim">Level ${lvl.id} — ${lvl.name}${d.levelStartedAt ? ` · week ${weeksIn + 1}` : ""}
      · ${d.sessions.length} session${d.sessions.length === 1 ? "" : "s"} logged</div>
    ${eligible ? `<div class="banner">🎓 All tracks at top range — schedule your graduation day!</div>` : ""}
    ${timeGate && allTop ? `<div class="banner soft">Top range reached — graduation unlocks at week ${lvl.minWeeks}.</div>` : ""}
    <div class="tracks">${bars}</div>
    <h3>Levels</h3>
    ${levelRows}
  </div>`));
}

function renderSettings(root) {
  const d = Store.load();
  const opts = PROGRAM.levels.map(L =>
    `<option value="${L.id}" ${L.id === d.currentLevel ? "selected" : ""}>L${L.id} — ${L.name}${L.playable ? "" : " (not wired yet)"}</option>`).join("");
  root.appendChild(h(`<div class="pad">
    <h1>Settings</h1>
    <h3>Current level</h3>
    <select id="lvlSel">${opts}</select>
    <p class="dim">Changing level resets the level-start clock, not your logs.</p>
    <h3>Data</h3>
    <p class="dim">Everything is stored on this device only. Deleting the app icon deletes the data — export a backup once in a while.</p>
    <div class="row">
      <button class="secondary" id="expBtn">Export backup</button>
      <button class="secondary" id="impBtn">Import backup</button>
    </div>
    <input type="file" id="impFile" accept=".json,application/json" hidden>
    <h3>Danger zone</h3>
    <p class="dim">Wipes all logged sessions and resets the level — for demos and test runs.</p>
    <button class="danger" id="resetBtn">Reset all data…</button>
    <p class="dim about">Claudisthenics v0.1 — program v${PROGRAM.version}</p>
  </div>`));
  $("#lvlSel").onchange = e => { Store.setLevel(Number(e.target.value)); toast("Level set"); render(); };
  $("#expBtn").onclick = () => Store.exportData();
  $("#impBtn").onclick = () => $("#impFile").click();
  $("#impFile").onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then(txt => {
      if (!confirm("Importing replaces ALL current data with the backup. Continue?")) return;
      try { Store.importData(txt); toast("Backup restored"); render(); }
      catch (err) { alert("Import failed: " + err.message); }
    });
  };
  $("#resetBtn").onclick = () => {
    const typed = prompt('This erases every logged session on this device.\nType RESET to confirm:');
    if (typed === "RESET") { Store.reset(); toast("All data erased"); render(); }
    else if (typed !== null) toast("Not erased (confirmation didn't match)");
  };
}

// ---------------------------------------------------------------- shell
function render() {
  const root = $("#screen");
  root.innerHTML = "";
  $("#tabbar").style.display = workout ? "none" : "";
  if (workout) { renderWorkout(root); return; }
  ({today: renderToday, progress: renderProgress, settings: renderSettings})[tab](root);
  document.querySelectorAll("#tabbar button").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === tab));
}

document.querySelectorAll("#tabbar button").forEach(b =>
  b.onclick = () => { tab = b.dataset.tab; render(); });

if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("sw.js");

render();
