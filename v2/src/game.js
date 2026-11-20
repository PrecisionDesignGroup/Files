/* ---------- PLAY: "The Ascent" — a 1D climb up a spiral tower ----------
   The player only moves along the stair. The section dial becomes the crank while a run is live:
   drag or scroll it up to climb, down to back off. Hold the top / bottom of the crank to walk.
   Floors are checkpoints. Hazards: spikes (timed), blades (timed), ghosts (patrol), boulders (hide in doorways). */
(function () {
  const screenEl = document.getElementById("screen"), rail = document.getElementById("rail");
  const panel = document.querySelector('[data-panel="play"]');
  if (!screenEl || !rail || !panel) return;
  const $ = (s) => panel.querySelector(s);
  const cv = $("#gCanvas"), ctx = cv.getContext("2d"), wrap = $(".g-stage");
  const ui = { floor: $("#gFloor"), h: $("#gH"), falls: $("#gFalls"), best: $("#gBest"), best2: $("#gBest2"), banner: $("#gBanner"), title: $("#gTitle"), start: $("#gStart"), exit: $("#gExit") };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPR = 20, F = 26, TILT = .3, K = 2 * Math.PI / SPR, MAXV = 7.5;
  let W = 0, H = 0, dpr = 1, TR = 100, SW = 55, RISE = 13, cx = 0, py0 = 0;
  let C = {};
  function readColors() {
    const cs = getComputedStyle(screenEl), g = (n, d) => (cs.getPropertyValue(n).trim() || d);
    C = { bg: g("--bg", "#E7E8E4"), surface: g("--surface", "#F5F5F2"), line: g("--line", "#CBCCC7"), ink: g("--ink", "#121316"), soft: g("--muted", "#62666C"), accent: g("--accent", "#F2C649"), accentInk: g("--accent-ink", "#1A1608") };
    C.inkRGB = hexRGB(C.ink);
  }
  function hexRGB(h) { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(","); }
  const ink = (a) => `rgba(${C.inkRGB},${a})`;

  function resize() {
    const r = wrap.getBoundingClientRect(); W = Math.max(200, r.width); H = Math.max(200, r.height);
    /* 32-bit look: draw the scene at about 360 px wide and blow it up with hard pixel edges */
    const PX = Math.max(2, Math.round(W / 360)); dpr = 1 / PX;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.imageSmoothingEnabled = false; cv.style.width = W + "px"; cv.style.height = H + "px";
    TR = Math.max(46, Math.min(W * .2, H * .19, 150)); SW = TR * .62; RISE = TR * .135;
    cx = W / 2; py0 = H * .56;
    readColors();
  }

  /* ---------- floors & hazards (seeded so a floor is the same every run) ---------- */
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const floors = new Map();
  function floorData(n) {
    if (floors.has(n)) return floors.get(n);
    const r = rng(n * 9973 + 17), L = n * F, hz = [], doors = [];
    const between = (a, b) => a + r() * (b - a);
    if (n >= 3 && n % 2 === 1) {
      for (let k = L + 4; k <= L + F - 4; k += 5) doors.push(k);
      const v = Math.min(7.5, 3.6 + n * .25), span = F - 4;
      hz.push({ t: "boulder", top: L + F - 1, bot: L + 2, v, P: span / v + between(1.8, 2.8), ph: r() * 10 });
      const spots = [];
      for (let k = L + 6; k < L + F - 4; k++) if (!doors.includes(k) && !doors.includes(k - 1) && !doors.includes(k + 1)) spots.push(k);
      if (spots.length && n >= 5) { const k = spots[Math.floor(r() * spots.length)]; hz.push(spike(k, r, n)); }
    } else {
      const pool = ["spike"]; if (n >= 1) pool.push("ghost"); if (n >= 2) pool.push("blade");
      const want = Math.min(2 + n, 7); let k = L + 4 + Math.floor(r() * 2), made = 0;
      while (made < want && k < L + F - 3) {
        const type = made === 0 && n > 0 ? pool[pool.length - 1] : pool[Math.floor(r() * pool.length)];
        if (type === "ghost") {
          const len = 3 + Math.floor(r() * 3); if (k + len > L + F - 3) { k += 1; continue; }
          hz.push({ t: "ghost", a: k, b: k + len, v: Math.min(3.4, 1.3 + n * .18 + r() * .6), ph: r() * 2 }); k += len + 3;
        } else if (type === "blade") { hz.push({ t: "blade", k, P: Math.max(1.5, between(2, 2.7) - n * .05), ph: r() * 3 }); k += 3 + Math.floor(r() * 2); }
        else { hz.push(spike(k, r, n)); k += 3 + Math.floor(r() * 2); }
        made++;
      }
    }
    const d = { hz, doors }; floors.set(n, d); return d;
  }
  function spike(k, r, n) { return { t: "spike", k, P: Math.max(1.15, 1.6 + r() * .8 - n * .05), ph: r() * 3 }; }
  const tri = (x) => 1 - Math.abs(((x % 2) + 2) % 2 - 1);
  function state(h, t) {
    if (h.t === "spike") { const u = (((t + h.ph) % h.P) + h.P) % h.P / h.P; return { up: u < .42, warn: u > .82, u }; }
    if (h.t === "blade") { const th = 1.15 * Math.sin(2 * Math.PI * (t + h.ph) / h.P); return { th, hot: Math.abs(th) < .32 }; }
    if (h.t === "ghost") return { s: h.a + (h.b - h.a) * tri(t * h.v / (h.b - h.a) + h.ph) };
    if (h.t === "boulder") { const l = (((t + h.ph) % h.P) + h.P) % h.P, s = h.top - l * h.v; return { s, live: s >= h.bot, l }; }
  }

  /* ---------- game state ---------- */
  let playing = false, active = false, sp = .5, camH = 0, camA = .5, t = 0, cp = 0, falls = 0, dead = 0, invul = 0, face = 1, best = 0;
  let jumpT = 0; const JUMP = .8;
  let pending = 0, holdDir = 0, keyDir = 0, crankPos = 0, shake = 0, lastStep = 0, bannerT;
  try { best = +localStorage.getItem("pd-ascent-best") || 0; } catch {}
  const L0 = (n) => n * F;
  const footH = (s) => { const f = Math.floor(s), fr = s - f; return f + (fr < .72 ? 0 : (x => x * x * (3 - 2 * x))((fr - .72) / .28)); };
  const air = () => jumpT > 0 ? Math.sin(Math.PI * (1 - jumpT / JUMP)) : 0;
  const airborne = () => jumpT > 0 && air() > .2;
  function jump() { if (!playing || dead || jumpT > 0) return; jumpT = JUMP; tone(520, .12, "square", .04, 380); try { navigator.vibrate && navigator.vibrate(6); } catch {} }
  const inDoor = (s) => floorData(Math.floor(s / F)).doors.some(k => Math.abs(s - (k + .5)) < .38);

  function hud() {
    ui.floor.textContent = String(cp + 1).padStart(2, "0");
    ui.h.textContent = String(Math.max(0, Math.floor(sp))).padStart(3, "0");
    ui.falls.textContent = String(falls).padStart(2, "0");
    ui.best.textContent = ui.best2.textContent = String(best).padStart(2, "0");
  }
  function banner(txt, sub) {
    ui.banner.innerHTML = `<b>${txt}</b>${sub ? `<span>${sub}</span>` : ""}`;
    ui.banner.classList.remove("show"); void ui.banner.offsetWidth; ui.banner.classList.add("show");
    clearTimeout(bannerT); bannerT = setTimeout(() => ui.banner.classList.remove("show"), 1400);
  }

  /* ---------- sound ---------- */
  let ac;
  function tone(f, d = .08, type = "square", g = .05, slide = 0) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), v = ac.createGain(), n = ac.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, n); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), n + d);
      v.gain.setValueAtTime(g, n); v.gain.exponentialRampToValueAtTime(.0001, n + d);
      o.connect(v).connect(ac.destination); o.start(n); o.stop(n + d + .02);
    } catch {}
  }


  /* ---------- the climber: boy or girl, long-sleeve tee or hoodie with a premade graphic, shorts or pants ---------- */
  const GRAPHICS = (window.SHOPV || []).filter(p => /^g\d+$/.test(p.id)).map(p => ({ id: p.id, t: p.t, c: (p.cw && p.cw[0] && p.cw[0][0]) || "#d9d9d6" }));
  const LOOK_KEY = "pd-ascent-look", artImg = {};
  let look = { g: "boy", top: "tee", art: (GRAPHICS[1] || GRAPHICS[0] || {}).id || "", bot: "pants" };
  try { const v = JSON.parse(localStorage.getItem(LOOK_KEY) || "null"); if (v) look = Object.assign(look, v); } catch {}
  if (GRAPHICS.length && !GRAPHICS.some(g => g.id === look.art)) look.art = GRAPHICS[0].id;
  function art(id) {
    if (artImg[id] !== undefined) return artImg[id];
    const url = window.PD_GM_ART && window.PD_GM_ART(id); if (!url) return (artImg[id] = null);
    const im = new Image(); im.crossOrigin = "anonymous"; im.onload = () => { im.ok = 1; drawPreview(); }; im.src = url; return (artImg[id] = im);
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
  /* sprite colours stay fixed in light and dark mode (dark outline, light skin), like a pixel sprite */
  const INK = "#141519";
  function drawClimber(c, x, y, u, face, leg, lk) {
    const g = GRAPHICS.find(q => q.id === lk.art) || { c: C.surface }, cloth = g.c, skin = "#F3F1EC", hood = lk.top === "hood", girl = lk.g === "girl";
    c.lineWidth = Math.max(1, u * .28); c.strokeStyle = INK; c.lineJoin = "round";
    // legs
    for (const [lx, d] of [[x - u * 1.45, leg * .5], [x + u * .35, -leg * .5]]) {
      const X = lx + d;
      if (lk.bot === "shorts") {
        rr(c, X, y - u * 1.9, u * 1.1, u * 1.6, u * .3); c.fillStyle = skin; c.fill(); c.stroke();
        c.fillStyle = INK; c.fillRect(X - u * .1, y - u * 3.1, u * 1.3, u * 1.4);
      } else { c.fillStyle = INK; c.fillRect(X, y - u * 3.1, u * 1.1, u * 2.8); }
      c.fillStyle = INK; rr(c, X - (face < 0 ? u * .45 : 0), y - u * .55, u * 1.55, u * .6, u * .25); c.fill();
    }
    // hood behind the head
    if (hood) { c.beginPath(); c.arc(x - face * u * .35, y - u * 9.7, u * 2.75, 0, 7); c.fillStyle = cloth; c.fill(); c.stroke(); }
    // ponytail behind the head
    if (girl) {
      c.fillStyle = INK; c.beginPath(); c.ellipse(x - face * u * 2.5, y - u * 9.3, u * .95, u * 2, -face * .35, 0, 7); c.fill();
      c.fillStyle = C.accent; c.beginPath(); c.arc(x - face * u * 2.05, y - u * 11.1, u * .5, 0, 7); c.fill(); c.stroke();
    }
    // sleeves (both tops are long-sleeved) + hands
    const sw = hood ? u * 2.6 : u * 2.4;
    for (const s of [-1, 1]) {
      const ax = x + s * sw, sy = y - u * 7.7, swing = -s * leg * .35;
      rr(c, ax - u * .65 + swing * .3, sy, u * 1.3, u * 4, u * .5); c.fillStyle = cloth; c.fill(); c.stroke();
      if (hood) { c.fillStyle = INK; c.fillRect(ax - u * .6 + swing * .3, sy + u * 3.4, u * 1.2, u * .35); }
      c.beginPath(); c.arc(ax + swing * .3, sy + u * 4.45, u * .62, 0, 7); c.fillStyle = skin; c.fill(); c.stroke();
    }
    // torso
    const tw = hood ? u * 4.8 : u * 4.4, th = hood ? u * 5.6 : u * 5.2;
    rr(c, x - tw / 2, y - u * 8, tw, th, u * .7); c.fillStyle = cloth; c.fill(); c.stroke();
    if (hood) {
      c.beginPath(); c.moveTo(x - u * 1.5, y - u * 3.6); c.lineTo(x - u * 1.1, y - u * 4.9); c.lineTo(x + u * 1.1, y - u * 4.9); c.lineTo(x + u * 1.5, y - u * 3.6); c.stroke();
      c.beginPath(); c.moveTo(x - u * .5, y - u * 7.9); c.lineTo(x - u * .6, y - u * 6.6); c.moveTo(x + u * .5, y - u * 7.9); c.lineTo(x + u * .6, y - u * 6.6); c.stroke();
    } else { c.beginPath(); c.arc(x, y - u * 8.05, u * .95, 0, Math.PI); c.fillStyle = skin; c.fill(); c.stroke(); }
    // the graphic on the chest
    const im = art(lk.art);
    if (im && im.ok) {
      const box = hood ? u * 2.5 : u * 3, k = Math.min(box / im.naturalWidth, box / im.naturalHeight), iw = im.naturalWidth * k, ih = im.naturalHeight * k;
      c.drawImage(im, x - iw / 2, (hood ? y - u * 6.25 : y - u * 5.6) - ih / 2, iw, ih);
    }
    // head + hair
    c.beginPath(); c.arc(x, y - u * 10, u * 2.1, 0, 7); c.fillStyle = skin; c.fill(); c.stroke();
    c.fillStyle = INK; c.beginPath(); c.arc(x, y - u * 10, u * 2.25, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(x + face * u * 1.9, y - u * 10.4); c.lineTo(x - face * u * .2, y - u * 11.2); c.lineTo(x - face * u * 2.2, y - u * 9.6); c.closePath(); c.fill();
    if (girl) { c.beginPath(); c.ellipse(x - face * u * 1.75, y - u * 9.3, u * .6, u * 1.5, 0, 0, 7); c.fill(); }
    c.fillRect(x + face * u * .7 - u * .3, y - u * 10.1, u * .6, u * .75);
  }
  const prev = $("#gPrev"), pick = $("#gPick");
  function drawPreview() {
    if (!prev || !prev.offsetWidth) return;
    const d = .5, w = prev.offsetWidth, h = prev.offsetHeight;
    if (prev.width !== Math.round(w * d)) { prev.width = Math.round(w * d); prev.height = Math.round(h * d); }
    const c = prev.getContext("2d"); c.imageSmoothingEnabled = false; c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
    c.fillStyle = C.line; c.beginPath(); c.ellipse(w / 2, h - 12, w * .3, 5, 0, 0, 7); c.fill();
    drawClimber(c, w / 2, h - 12, h / 17, 1, 0, look);
  }
  function paintPick() {
    if (!pick) return;
    pick.querySelectorAll(".gp-seg").forEach(sg => sg.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(look[sg.dataset.k] === b.dataset.v))));
    pick.querySelectorAll(".gp-arts button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.id === look.art)));
    const g = GRAPHICS.find(q => q.id === look.art); $("#gArtName").textContent = g ? g.t : "";
    try { localStorage.setItem(LOOK_KEY, JSON.stringify(look)); } catch {}
    drawPreview();
  }
  if (pick) {
    const arts = $("#gArts");
    arts.innerHTML = GRAPHICS.map(g => { const u = window.PD_GM_ART && window.PD_GM_ART(g.id); return `<button type="button" role="radio" data-id="${g.id}" style="background:${g.c}" aria-label="${g.t.replace(/"/g, "&quot;")}">${u ? `<img src="${u}" alt="" loading="lazy">` : ""}</button>`; }).join("");
    arts.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; look.art = b.dataset.id; tone(660, .05); paintPick(); });
    pick.querySelectorAll(".gp-seg").forEach(sg => sg.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; look[sg.dataset.k] = b.dataset.v; tone(587, .05); paintPick(); }));
    $("#gPickBack").addEventListener("click", () => { pick.hidden = true; ui.title.hidden = false; });
    $("#gGo").addEventListener("click", () => { pick.hidden = true; start(); });
  }
  function openPick() {
    if (!pick) return start();
    ui.title.hidden = true; pick.hidden = false; paintPick();
    pick.scrollTop = 0; const sel = pick.querySelector('.gp-arts [aria-checked="true"]'); if (sel) sel.parentNode.scrollLeft = sel.offsetLeft - sel.parentNode.offsetLeft - sel.parentNode.clientWidth / 2 + sel.offsetWidth / 2;
    try { window.gtag && gtag("event", "game_pick_open"); } catch {}
  }

  /* ---------- run control ---------- */
  function start() {
    playing = true; jumpT = 0; sp = .5; camH = 0; camA = .5; cp = 0; falls = 0; dead = 0; invul = 1; pending = 0; t = 0; lastStep = 0;
    screenEl.classList.add("gaming"); ui.title.hidden = true; hud(); banner("Floor 01", "Turn the dial up to climb");
    tone(523, .09); setTimeout(() => tone(784, .12), 90);
    crank.focus({ preventScroll: true });
  }
  function exit() {
    playing = false; holdDir = keyDir = 0; pending = 0;
    screenEl.classList.remove("gaming"); if (pick) pick.hidden = true; ui.title.hidden = false; hud();
    try { rail.focus({ preventScroll: true }); } catch {}
  }
  function die() {
    if (dead || invul > 0) return;
    dead = .95; falls++; shake = 1; pending = 0; hud();
    tone(220, .25, "sawtooth", .06, -160);
    try { navigator.vibrate && navigator.vibrate(40); } catch {}
  }
  ui.start.addEventListener("click", openPick);
  ui.exit.addEventListener("click", exit);
  const jb = $("#gJump");
  if (jb) { jb.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); jump(); jb.classList.add("down"); }); const up = () => jb.classList.remove("down"); jb.addEventListener("pointerup", up); jb.addEventListener("pointercancel", up); jb.addEventListener("pointerleave", up); jb.addEventListener("click", e => e.preventDefault()); jb.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); jump(); } }); }

  /* ---------- the crank: lives over the section dial during a run ---------- */
  const crank = document.createElement("div");
  crank.className = "crank"; crank.id = "crank"; crank.tabIndex = -1;
  crank.setAttribute("role", "slider"); crank.setAttribute("aria-label", "Crank. Drag or scroll up to climb, down to back off. Arrow keys work too.");
  crank.innerHTML = `<span class="crank-dir up"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2.5 10 8.5H2z" fill="currentColor"/></svg>Climb</span>
    <div class="crank-ticks" aria-hidden="true">${Array.from({ length: 19 }, (_, i) => `<i${i % 3 === 0 ? ' class="major"' : ""}></i>`).join("")}</div>
    <span class="crank-notch" aria-hidden="true"></span>
    <span class="crank-dir down">Back<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 9.5 10 3.5H2z" fill="currentColor"/></svg></span>`;
  rail.appendChild(crank);
  const ticks = [...crank.querySelectorAll(".crank-ticks i")];
  function renderCrank() {
    const sp_ = 12, off = ((crankPos * 26) % (sp_ * 3) + sp_ * 3) % (sp_ * 3), mid = (ticks.length - 1) / 2;
    ticks.forEach((k, i) => { k.style.transform = `translateY(${((i - mid) * sp_ + off - sp_ * 1.5).toFixed(1)}px)`; });
    crank.classList.toggle("hold-up", holdDir > 0 || keyDir > 0);
    crank.classList.toggle("hold-down", holdDir < 0 || keyDir < 0);
  }
  let cd = null;
  const stop = (e) => { e.stopPropagation(); };
  crank.addEventListener("pointerdown", e => {
    stop(e); if (!playing) return; e.preventDefault();
    const r = crank.getBoundingClientRect(), fy = (e.clientY - r.top) / r.height;
    cd = { y: e.clientY, id: e.pointerId, moved: false }; crank.setPointerCapture(e.pointerId);
    holdDir = fy < .3 ? 1 : fy > .7 ? -1 : 0;
  });
  crank.addEventListener("pointermove", e => {
    stop(e); if (!cd) return;
    const dy = e.clientY - cd.y;
    if (!cd.moved && Math.abs(dy) > 4) { cd.moved = true; holdDir = 0; crank.classList.add("dragging"); }
    if (cd.moved) { pending -= dy / 17; cd.y = e.clientY; }
  });
  const cEnd = (e) => { stop(e); cd = null; holdDir = 0; crank.classList.remove("dragging"); };
  crank.addEventListener("pointerup", cEnd); crank.addEventListener("pointercancel", cEnd);
  crank.addEventListener("click", stop);

  /* drag on the tower itself works as a crank too (phones) */
  let td = null;
  wrap.addEventListener("pointerdown", e => { if (!playing) return; td = { y: e.clientY, id: e.pointerId }; wrap.setPointerCapture(e.pointerId); });
  wrap.addEventListener("pointermove", e => { if (!td) return; pending -= (e.clientY - td.y) / 17; td.y = e.clientY; });
  const tEnd = () => { td = null; }; wrap.addEventListener("pointerup", tEnd); wrap.addEventListener("pointercancel", tEnd);

  /* while playing, scrolling anywhere turns the crank instead of changing sections */
  screenEl.addEventListener("wheel", e => {
    if (!playing) return;
    e.preventDefault(); e.stopPropagation();
    const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * (e.deltaMode === 1 ? 16 : 1);
    pending -= Math.max(-60, Math.min(60, d)) / 40;
  }, { capture: true, passive: false });
  window.addEventListener("keydown", e => {
    if (!playing) return;
    const up = e.key === "ArrowUp" || e.key === "w" || e.key === "W", dn = e.key === "ArrowDown" || e.key === "s" || e.key === "S";
    if (up || dn || e.key === "PageUp" || e.key === "PageDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); if (up) keyDir = 1; if (dn) keyDir = -1; }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); exit(); }
    if ((e.key === " " || e.code === "Space") && !e.repeat && !(e.target.closest && e.target.closest("button"))) { e.preventDefault(); e.stopPropagation(); jump(); }
  }, true);
  window.addEventListener("keyup", e => { if (["ArrowUp", "ArrowDown", "w", "W", "s", "S"].includes(e.key)) keyDir = 0; }, true);

  /* ---------- projection ---------- */
  function P(a, h, r) {
    const rel = (a - camA) * K, c = Math.cos(rel);
    return [cx + r * Math.sin(rel), py0 - (h - camH) * RISE + r * c * TILT, c];
  }
  function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }

  /* ---------- drawing ---------- */
  function drawTower(lo, hi) {
    const top = 0, bot = H;
    ctx.fillStyle = C.surface; ctx.fillRect(cx - TR, top, TR * 2, bot);
    // mortar rows + staggered joints, following the cylinder's curve
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    const rowH = 1.5, r0 = Math.floor(lo / rowH) - 2, r1 = Math.ceil(hi / rowH) + 2, cols = 14;
    for (let row = r0; row <= r1; row++) {
      const h = row * rowH, yb = py0 - (h - camH) * RISE;
      if (yb < -TR * TILT - 10 || yb > H + 10) continue;
      ctx.beginPath(); ctx.ellipse(cx, yb, TR, TR * TILT, 0, 0, Math.PI); ctx.stroke();
      const yt = yb - rowH * RISE;
      for (let j = 0; j < cols; j++) {
        const ang = (j + (row & 1) * .5) / cols * 2 * Math.PI - camA * K, c = Math.cos(ang);
        if (c < .12) continue;
        const x = cx + TR * Math.sin(ang), off = TR * c * TILT;
        ctx.beginPath(); ctx.moveTo(x, yb + off); ctx.lineTo(x, yt + off); ctx.stroke();
      }
    }
    const g = ctx.createLinearGradient(cx - TR, 0, cx + TR, 0);
    g.addColorStop(0, ink(.22)); g.addColorStop(.28, ink(0)); g.addColorStop(.7, ink(0)); g.addColorStop(1, ink(.26));
    ctx.fillStyle = g; ctx.fillRect(cx - TR, top, TR * 2, bot);
    ctx.strokeStyle = ink(.55); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - TR, 0); ctx.lineTo(cx - TR, H); ctx.moveTo(cx + TR, 0); ctx.lineTo(cx + TR, H); ctx.stroke();
  }
  function drawDoor(k, isLanding, n) {
    const a = k + .5, [x, y, c] = P(a, k, TR);
    if (c < .2) return;
    const w = SW * .42 * c, h = RISE * 3.3;
    ctx.fillStyle = C.ink; ctx.beginPath();
    ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h + w / 2); ctx.arc(x, y - h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
    if (isLanding && c > .45) {
      ctx.save(); ctx.translate(x, y - h - RISE * 1.1); ctx.scale(c, 1);
      ctx.fillStyle = C.accent; ctx.fillRect(-15, -9, 30, 16);
      ctx.fillStyle = C.accentInk; ctx.font = `600 10px "IBM Plex Mono", ui-monospace, monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(n + 1).padStart(2, "0"), 0, 0); ctx.restore();
    }
  }
  function drawStep(i, back) {
    const o = TR + SW, landing = i % F <= 1;
    const a = P(i, i, TR), b = P(i, i, o), c2 = P(i + 1, i, o), d = P(i + 1, i, TR);
    if (back) {
      poly([a, b, c2, d]); ctx.fillStyle = ink(.08); ctx.fill(); ctx.strokeStyle = ink(.18); ctx.lineWidth = 1; ctx.stroke(); return;
    }
    // riser (faces the way down the stair)
    const ra = P(i, i - 1, TR), rb = P(i, i - 1, o);
    if (Math.sin((i - camA) * K) > -.98) { poly([a, b, rb, ra]); ctx.fillStyle = C.line; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke(); }
    // outer face
    const ob = P(i, i - 1.1, o), oc = P(i + 1, i - 1.1, o);
    poly([b, c2, oc, ob]); ctx.fillStyle = C.ink; ctx.fill();
    // tread
    poly([a, b, c2, d]); ctx.fillStyle = landing ? C.bg : C.surface; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.stroke();
    if (landing && i % F === 0) { const m1 = P(i + .15, i, o - SW * .12), m2 = P(i + 1.85, i, o - SW * .12); ctx.strokeStyle = C.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m1[0], m1[1]); ctx.lineTo(m2[0], m2[1]); ctx.stroke(); }
  }
  const rMid = () => TR + SW * .5;
  function drawSpike(h, st) {
    const amt = st.up ? 1 : st.warn ? .28 : 0; if (!amt) return;
    for (let j = 0; j < 3; j++) {
      const r = TR + SW * (.2 + j * .3);
      for (let q = 0; q < 2; q++) {
        const s0 = h.k + .2 + q * .35, [x, y, c] = P(s0 + .18, h.k, r); if (c < .05) continue;
        const w = SW * .11 * Math.max(.35, c), ht = RISE * 2.1 * amt;
        ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x, y - ht); ctx.lineTo(x + w, y); ctx.closePath();
        ctx.fillStyle = C.ink; ctx.fill(); if (st.up) { ctx.strokeStyle = C.surface; ctx.lineWidth = .8; ctx.stroke(); }
      }
    }
  }
  function drawBlade(h, st) {
    const [x, y, c] = P(h.k + .5, h.k, rMid()); if (c < .05) return;
    const len = RISE * 5.2, px = x, py = y - len - RISE * 1.4;
    const ex = px + Math.sin(st.th) * len, ey = py + Math.cos(st.th) * len;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(-st.th);
    const bw = SW * .32 * Math.max(.5, c);
    ctx.beginPath(); ctx.moveTo(-bw, -3); ctx.quadraticCurveTo(0, RISE * 1.6, bw, -3); ctx.closePath();
    ctx.fillStyle = st.hot ? C.ink : C.soft; ctx.fill(); ctx.strokeStyle = C.surface; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
  /* ghosts are floating Precision Design monograms (the logo mark, drawn from its own path data) */
  const MONO = ["M 71.2 61.1C49.8 61.1 32.3 78.6 32.3 100C32.3 121.5 49.8 138.9 71.2 138.9C92.7 138.9 110.1 121.5 110.1 100C110.1 78.6 92.7 61.1 71.2 61.1M71.2 144.5C46.7 144.5 26.7 124.6 26.7 100C26.7 75.5 46.7 55.5 71.2 55.5C95.8 55.5 115.7 75.5 115.7 100C115.7 124.6 95.8 144.5 71.2 144.5","M 71.2 76.8C58.4 76.8 48 87.2 48 100C48 112.8 58.4 123.2 71.2 123.2C84 123.2 94.4 112.8 94.4 100C94.4 87.2 84 76.8 71.2 76.8M71.2 128.8C55.3 128.8 42.4 115.9 42.4 100C42.4 84.1 55.3 71.2 71.2 71.2C87.1 71.2 100 84.1 100 100C100 115.9 87.1 128.8 71.2 128.8","M 71.2 92.5C67.1 92.5 63.7 95.9 63.7 100C63.7 104.1 67.1 107.5 71.2 107.5C75.3 107.5 78.7 104.1 78.7 100C78.7 95.9 75.3 92.5 71.2 92.5M71.2 113.1C64 113.1 58.1 107.2 58.1 100C58.1 92.8 64 86.9 71.2 86.9C78.4 86.9 84.3 92.8 84.3 100C84.3 107.2 78.4 113.1 71.2 113.1"].map(d => new Path2D(d)), MCX = 71.2, MCY = 100, MR = 45;
  function monogram(x, y, r, spin, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(Math.max(.12, Math.abs(Math.cos(spin))) * r / MR, r / MR);
    ctx.beginPath(); ctx.arc(0, 0, MR, 0, 7); ctx.fillStyle = C.surface; ctx.fill();
    ctx.translate(-MCX, -MCY); ctx.fillStyle = C.ink; MONO.forEach(p => ctx.fill(p)); ctx.restore();
  }
  function drawGhost(s, now, h) {
    const [x, y, c] = P(s, Math.floor(s), rMid()); if (c < .05) return;
    const r = SW * .27 * (.65 + .35 * c), bob = Math.sin(now * 4 + s) * r * .18, gy = y - r * 2.2 + bob;
    const dir = h ? Math.sign(Math.cos(Math.PI * (now * h.v / (h.b - h.a) + h.ph))) || 1 : 1;
    ctx.fillStyle = ink(.12); ctx.beginPath(); ctx.ellipse(x, y, r * .8, r * .22, 0, 0, 7); ctx.fill();
    for (let k = 3; k >= 1; k--) { const [tx, ty] = P(s - dir * k * .28, Math.floor(s), rMid()); monogram(tx, ty - r * 2.2 + bob, r * (1 - k * .08), now * 1.6, .1 * (4 - k)); }
    monogram(x, gy, r, now * 1.6, 1);
  }
  function drawBoulder(st) {
    const [x, y, c] = P(st.s, footH(st.s), rMid()); if (c < .05) return;
    const r = SW * .3 * (.65 + .35 * c);
    ctx.beginPath(); ctx.arc(x, y - r, r, 0, 7); ctx.fillStyle = C.ink; ctx.fill();
    ctx.save(); ctx.translate(x, y - r); ctx.rotate(st.s * 1.3); ctx.strokeStyle = C.surface; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-r * .6, 0); ctx.lineTo(r * .5, -r * .2); ctx.moveTo(-r * .1, r * .55); ctx.lineTo(r * .2, -r * .5); ctx.stroke(); ctx.restore();
  }
  function drawPlayer(now) {
    const hide = inDoor(sp);
    const r = hide ? TR + SW * .02 : rMid();
    let [x, y] = P(sp, footH(sp), r);
    const lift = air() * RISE * 3.4;
    if (lift > 0) { ctx.fillStyle = ink(.18 * (1 - air() * .6)); ctx.beginPath(); ctx.ellipse(x, y, SW * .16 * (1 - air() * .4), SW * .05, 0, 0, 7); ctx.fill(); y -= lift; }
    const u = SW * .075, fr = sp - Math.floor(sp), walk = Math.abs(pending) > .02 || holdDir || keyDir;
    ctx.save();
    if (dead) { ctx.globalAlpha = Math.max(0, dead); ctx.translate(x, y - u * 4); ctx.rotate((1 - dead) * 3 * -face); ctx.translate(-x, -(y - u * 4)); y -= (1 - dead) * u * 10; }
    if (invul > 0 && !dead && Math.floor(now * 14) % 2) ctx.globalAlpha = .45;
    if (hide) ctx.globalAlpha *= .7;
    const leg = walk ? Math.sin(fr * Math.PI * 2) * u * 1.2 : 0;
    drawClimber(ctx, x, y, u, face, leg, look);
    ctx.restore();
    if (dead) { ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.globalAlpha = dead; ctx.beginPath(); ctx.arc(x, y - u * 6, (1 - dead) * SW, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    if (shake > 0 && !reduced) ctx.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 8 * shake);
    const lo = Math.floor(camH - (H - py0) / RISE - 4), hi = Math.ceil(camH + py0 / RISE + 4);
    const i0 = Math.max(0, lo), i1 = hi;
    // ground
    const gy = py0 - (0 - camH) * RISE;
    if (gy < H + TR) { ctx.fillStyle = C.line; ctx.beginPath(); ctx.ellipse(cx, gy + RISE, W, TR * TILT * 2.2, 0, Math.PI, 0); ctx.lineTo(W * 2, H * 2); ctx.lineTo(-W, H * 2); ctx.closePath(); ctx.fill(); ctx.fillRect(-W, gy + RISE, W * 3, H); }
    const front = [], backs = [];
    for (let i = i0; i <= i1; i++) { const c = Math.cos((i + .5 - camA) * K); (c < 0 ? backs : front).push([i, c]); }
    backs.forEach(([i]) => drawStep(i, true));
    drawTower(lo, hi);
    const fl = Math.floor(Math.max(0, camA) / F);
    for (let n = Math.max(0, fl - 2); n <= fl + 2; n++) {
      const d = floorData(n); d.doors.forEach(k => drawDoor(k, false, n));
      drawDoor(L0(n) + .5, true, n);
    }
    front.sort((a, b) => a[1] - b[1]).forEach(([i]) => drawStep(i, false));
    for (let n = Math.max(0, fl - 2); n <= fl + 2; n++) {
      for (const h of floorData(n).hz) {
        const st = state(h, t);
        if (h.t === "spike") drawSpike(h, st);
        else if (h.t === "blade") drawBlade(h, st);
        else if (h.t === "ghost") drawGhost(st.s, now, h);
        else if (h.t === "boulder" && st.live) drawBoulder(st);
      }
    }
    drawPlayer(now);
  }

  /* ---------- update ---------- */
  function update(dt, now) {
    t += dt;
    if (!playing) { // attract mode: the fool wanders up on his own
      sp += dt * 1.4; if (sp > F * 3) sp = .5;
      camA += (sp - camA) * Math.min(1, dt * 8); camH += (footH(sp) - camH) * Math.min(1, dt * 6); face = 1;
      return;
    }
    if (dead > 0) {
      dead -= dt;
      if (dead <= 0) { dead = 0; sp = L0(cp) + .6; camA = sp; invul = 1.2; pending = 0; tone(392, .08); }
    } else {
      pending = Math.max(-2, Math.min(2, pending));
      let mv = Math.max(-MAXV * dt, Math.min(MAXV * dt, pending)); pending -= mv;
      mv += (holdDir || keyDir) * 4.2 * dt;
      if (jumpT > 0) mv += face * 2.6 * dt; // a jump carries you forward a couple of steps
      pending *= Math.pow(.02, dt);
      if (Math.abs(mv) > 1e-4) face = Math.sign(mv);
      sp = Math.max(.3, sp + mv); crankPos += mv;
      const step = Math.floor(sp); if (step !== lastStep) { if (step > lastStep) tone(900 + (step % F) * 12, .025, "square", .02); lastStep = step; }
      invul = Math.max(0, invul - dt); jumpT = Math.max(0, jumpT - dt);
      const n = Math.floor(sp / F);
      if (n > cp && sp - L0(n) > .5) {
        cp = n; if (cp + 1 > best) { best = cp + 1; try { localStorage.setItem("pd-ascent-best", best); } catch {} }
        const next = floorData(n), tip = next.doors.length ? "Boulders ahead — jump them or duck into doorways" : n === 1 ? "Ghosts: jump over them" : n === 2 ? "Blades: go when they swing away — jumping won't help" : "";
        banner(`Floor ${String(cp + 1).padStart(2, "0")}`, tip); tone(659, .1); setTimeout(() => tone(988, .16), 100);
      }
      // collisions
      if (!invul) {
        const fNow = Math.floor(sp / F);
        for (let m = Math.max(0, fNow - 1); m <= fNow + 1 && !dead; m++) for (const h of floorData(m).hz) {
          const st = state(h, t);
          if (h.t === "spike" && st.up && !airborne() && Math.abs(sp - (h.k + .5)) < .48) die("spike");
          else if (h.t === "blade" && st.hot && Math.abs(sp - (h.k + .5)) < .6) die("blade");
          else if (h.t === "ghost" && !airborne() && Math.abs(sp - st.s) < .48) die("ghost");
          else if (h.t === "boulder" && st.live && Math.abs(sp - st.s) < .62 && !inDoor(sp) && !airborne()) die("boulder");
          if (dead) break;
        }
      }
      hud();
    }
    shake = Math.max(0, shake - dt * 3);
    camA += (sp - camA) * Math.min(1, dt * 14);
    camH += (footH(sp) - camH) * Math.min(1, dt * 9);
    renderCrank();
  }

  let raf = 0, last = 0;
  function frame(ts) {
    raf = 0; if (!active || document.hidden) return;
    const now = ts / 1000, dt = Math.min(.05, last ? now - last : .016); last = now;
    update(dt, now); draw(now);
    raf = requestAnimationFrame(frame);
  }
  function setActive(on) {
    if (on === active) return; active = on;
    if (on) { resize(); hud(); last = 0; if (!raf) raf = requestAnimationFrame(frame); }
    else if (playing) exit();
  }
  new MutationObserver(() => setActive(screenEl.classList.contains("sec-play"))).observe(screenEl, { attributes: true, attributeFilter: ["class"] });
  new ResizeObserver(() => { if (active) resize(); }).observe(wrap);
  document.addEventListener("visibilitychange", () => { if (active && !document.hidden && !raf) { last = 0; raf = requestAnimationFrame(frame); } });
  window.addEventListener("pdtheme", readColors);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => setTimeout(readColors, 30));
  setActive(screenEl.classList.contains("sec-play"));
  hud();
  window.pdAscent = { jump, ghost: () => { for (const h of floorData(Math.floor(sp / F)).hz) if (h.t === "ghost") return state(h, t).s; return null; }, start, exit, get s() { return sp; }, set s(v) { sp = v; camA = v; }, get falls() { return falls; }, get floor() { return cp + 1; } };
})();
