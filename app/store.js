// Local persistence: everything lives in localStorage, nothing leaves the device.
const Store = (() => {
  const KEY = "claudisthenics.data.v1";

  const defaults = () => ({
    schemaVersion: 1,
    currentLevel: 0,
    levelStartedAt: null,   // ISO date, set on first session of a level
    sessions: []            // [{date, level, results:{track:[v,..]}, core:{id:[v,..]}, partial}]
  });

  let data = null;
  function load() {
    if (data) return data;
    try { data = JSON.parse(localStorage.getItem(KEY)) || defaults(); }
    catch { data = defaults(); }
    return data;
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(data)); }

  function addSession(session) {
    load();
    if (!data.levelStartedAt) data.levelStartedAt = session.date;
    data.sessions.push(session);
    save();
  }

  function setLevel(id) {
    load();
    data.currentLevel = id;
    data.levelStartedAt = null;
    save();
  }

  // Latest non-partial session for a level (progress is judged on full sessions).
  function lastFullSession(levelId) {
    load();
    for (let i = data.sessions.length - 1; i >= 0; i--) {
      const s = data.sessions[i];
      if (s.level === levelId && !s.partial) return s;
    }
    return null;
  }

  function sessionsThisWeek() {
    load();
    const now = new Date();
    const day = (now.getDay() + 6) % 7;            // Monday = 0
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - day);
    return data.sessions.filter(s => new Date(s.date) >= monday).length;
  }

  function exportData() {
    load();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `claudisthenics-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importData(json) {
    const parsed = JSON.parse(json);               // throws on garbage
    if (typeof parsed.schemaVersion !== "number" || !Array.isArray(parsed.sessions))
      throw new Error("Not a Claudisthenics backup file");
    data = parsed;
    save();
  }

  function reset() {
    localStorage.removeItem(KEY);
    data = null;
  }

  return { load, addSession, setLevel, lastFullSession, sessionsThisWeek,
           exportData, importData, reset };
})();
