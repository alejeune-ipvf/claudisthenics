// Pose-interpolation stick-figure engine (shared with viz/ gallery)
const Viz = (() => {
  const SVGNS = "http://www.w3.org/2000/svg";
  const lerp = (a, b, t) => a + (b - a) * t;
  const anims = [];
  let running = false;

  function el(tag, attrs, cls) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (cls) e.setAttribute("class", cls);
    return e;
  }

  // Mounts an animated figure into `svg` for pose set POSES[vizId].
  function mount(svg, vizId) {
    const ex = POSES[vizId];
    if (!ex) return;
    svg.setAttribute("viewBox", "0 0 340 240");
    svg.innerHTML = "";
    svg.appendChild(el("line", {x1:10, y1:212, x2:330, y2:212}, "ground"));
    for (const p of (ex.props || [])) {
      if (p.t === "line") svg.appendChild(el("line", {x1:p.x1, y1:p.y1, x2:p.x2, y2:p.y2}, "prop"));
      if (p.t === "rect") svg.appendChild(el("rect", {x:p.x, y:p.y, width:p.w, height:p.h, rx:4}, "propfill"));
      if (p.t === "circ") svg.appendChild(el("circle", {cx:p.cx, cy:p.cy, r:p.r}, "prop"));
    }
    const parts = {
      band: ex.band ? svg.appendChild(el("polyline", {}, "band")) : null,
      leg2: svg.appendChild(el("polyline", {}, "fig2")),
      arm2: svg.appendChild(el("polyline", {}, "fig2")),
      body: svg.appendChild(el("polyline", {}, "fig")),
      arm:  svg.appendChild(el("polyline", {}, "fig")),
      head: svg.appendChild(el("circle", {r:12}, "headfill")),
    };
    const pts = js => js.map(p => p.join(",")).join(" ");
    function draw(t) {
      const A = ex.poses[0], B = ex.poses[1] || A;
      const P = {};
      for (const k in A) P[k] = [lerp(A[k][0], B[k][0], t), lerp(A[k][1], B[k][1], t)];
      parts.body.setAttribute("points", pts([P.ankle, P.knee, P.hip, P.shoulder]));
      parts.arm.setAttribute("points", pts([P.shoulder, P.elbow, P.wrist]));
      parts.leg2.setAttribute("points", P.knee2 ? pts([P.hip, P.knee2, P.ankle2]) : "");
      parts.arm2.setAttribute("points", P.elbow2 ? pts([P.shoulder, P.elbow2, P.wrist2]) : "");
      parts.head.setAttribute("cx", P.head[0]);
      parts.head.setAttribute("cy", P.head[1]);
      if (parts.band) parts.band.setAttribute("points", pts([ex.band.anchor, P[ex.band.joint]]));
    }
    draw(0);
    if (!ex.hold) anims.push({svg, draw, period: ex.period || 2000});
    start();
  }

  // Drops animations whose svg left the DOM (screen changed).
  function start() {
    if (running) return;
    running = true;
    const t0 = performance.now();
    (function loop(now) {
      for (let i = anims.length - 1; i >= 0; i--) {
        if (!anims[i].svg.isConnected) { anims.splice(i, 1); continue; }
        const t = (1 - Math.cos((now - t0) / anims[i].period * Math.PI)) / 2;
        anims[i].draw(t);
      }
      if (anims.length === 0) { running = false; return; }
      requestAnimationFrame(loop);
    })(t0);
  }

  return { mount };
})();
