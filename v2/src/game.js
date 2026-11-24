/* ---------- PLAY: "The Ascent" — a 1D climb up a spiral tower ----------
   The player only moves along the stair. The section dial becomes the crank while a run is live:
   drag or scroll it up to climb, down to back off. Hold the top / bottom of the crank to walk.
   Floors are checkpoints. Hazards: spikes (timed), blades (timed), ghosts (patrol), boulders (hide in doorways). */
(function () {
  const screenEl = document.getElementById("screen"), rail = document.getElementById("rail");
  const panel = document.querySelector('[data-panel="play"]');
  if (!screenEl || !rail || !panel) return;
  const $ = (s) => panel.querySelector(s);
  const cv = $("#gCanvas"), ctx = cv.getContext("2d", { willReadFrequently: true }), wrap = $(".g-stage");
  const ui = { floor: $("#gFloor"), h: $("#gH"), falls: $("#gFalls"), best: $("#gBest"), best2: $("#gBest2"), banner: $("#gBanner"), reward: $("#gReward"), claim: $("#gClaim"), title: $("#gTitle"), start: $("#gStart"), exit: $("#gExit"), post: $("#gPost") };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPR = 20, F = 26, TILT = .3, K = 2 * Math.PI / SPR, MAXV = 7.5;
  let W = 0, H = 0, dpr = 1, TR = 100, SW = 55, RISE = 13, cx = 0, py0 = 0;
  let C = {};
  /* 1-bit bitmap look: the scene is drawn in greys, then every pixel is dithered to two tones (charcoal + bone) */
  function readColors() {
    C = { bg: "#000000", surface: "#1e1e1e", line: "#646464", ink: "#ECECE8", soft: "#9a9a9a", accent: "#F4F4F0", accentInk: "#121212", ground: "#3a3a3a" };
    C.inkRGB = hexRGB(C.ink);
  }
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
  const DK = [8, 8, 8], LT = [255, 255, 255];
  function bitmap(c, w, h) {
    let im; try { im = c.getImageData(0, 0, w, h); } catch { return; }
    const d = im.data;
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) {
      const a = d[i + 3] / 255, L = ((d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255 * a - .15) / .7;
      const o = L > BAYER[(y & 3) * 4 + (x & 3)] ? LT : DK;
      d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
    }
    c.putImageData(im, 0, 0);
  }
  window.PD_BITMAP = bitmap;
  function hexRGB(h) { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(","); }
  const ink = (a) => `rgba(${C.inkRGB},${a})`;

  function artScale(w = W, h = H) {
    const dd = window.devicePixelRatio || 1; let k = 2;
    while ((w * dd / k) * (h * dd / k) > 650000) k++;
    return dd / k;
  }
  function resize() {
    const r = wrap.getBoundingClientRect(); W = Math.max(200, r.width); H = Math.max(200, r.height);
    /* bitmap look, kept crisp: one art pixel = exactly ART device pixels (whole numbers, so no uneven or blurry pixels),
       and the canvas is sized to a whole number of art pixels so the browser never stretches it */
    dpr = artScale();
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr); ctx.imageSmoothingEnabled = false;
    cv.style.width = cv.width / dpr + "px"; cv.style.height = cv.height / dpr + "px";
    TR = Math.max(46, Math.min((W - (parseFloat(getComputedStyle(panel.querySelector(".g")).paddingLeft) || 0) - (parseFloat(getComputedStyle(panel.querySelector(".g")).paddingRight) || 0)) * .2, H * .19, 150)); SW = TR * .62; RISE = TR * .135;
    /* the game fills the whole frame; centre the tower in the part not covered by the side nav */
    const gcs = getComputedStyle(panel.querySelector(".g")), gl = parseFloat(gcs.paddingLeft) || 0, gr = parseFloat(gcs.paddingRight) || 0;
    cx = gl + (W - gl - gr) / 2; py0 = H * .56;
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
    if (n >= 9) { const a = L + 6 + Math.floor(r() * 3), len = 9 + Math.floor(r() * 4); hz.push({ t: "monster", a, b: Math.min(L + F - 3, a + len), v: Math.min(4.2, 2.2 + (n - 9) * .15 + r() * .5), ph: r() * 2 }); }
    const d = { hz, doors }; floors.set(n, d); return d;
  }
  function spike(k, r, n) { return { t: "spike", k, P: Math.max(1.15, 1.6 + r() * .8 - n * .05), ph: r() * 3 }; }
  const tri = (x) => 1 - Math.abs(((x % 2) + 2) % 2 - 1);
  function state(h, t) {
    if (h.t === "spike") { const u = (((t + h.ph) % h.P) + h.P) % h.P / h.P; return { up: u < .42, warn: u > .82, u }; }
    if (h.t === "blade") { const th = 1.15 * Math.sin(2 * Math.PI * (t + h.ph) / h.P); return { th, hot: Math.abs(th) < .32 }; }
    if (h.t === "ghost" || h.t === "monster") return { s: h.a + (h.b - h.a) * tri(t * h.v / (h.b - h.a) + h.ph) };
    if (h.t === "boulder") { const l = (((t + h.ph) % h.P) + h.P) % h.P, s = h.top - l * h.v; return { s, live: s >= h.bot, l }; }
  }

  /* ---------- game state ---------- */
  let playing = false, active = false, sp = .5, camH = 0, camA = .5, t = 0, cp = 0, falls = 0, dead = 0, invul = 0, face = 1, best = 0;
  let jumpT = 0; const JUMP = .8;
  let got = 0, power = 0, sword = false, slashT = 0; const taken = new Set(), slain = new Set();
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
    if (ui.post) ui.post.textContent = sword ? got + " + SWORD" : String(got);
    ui.best.textContent = ui.best2.textContent = String(best).padStart(2, "0");
  }
  function banner(txt, sub) {
    ui.banner.innerHTML = `<b>${txt}</b>${sub ? `<span>${sub}</span>` : ""}`;
    ui.banner.classList.remove("show"); void ui.banner.offsetWidth; ui.banner.classList.add("show");
    clearTimeout(bannerT); bannerT = setTimeout(() => ui.banner.classList.remove("show"), 1400);
  }

  /* ---------- sound ---------- */
  let ac;
  /* ---------- sound: retro chip sounds made on the fly with Web Audio (no files) ---------- */
  let muted = false; try { muted = localStorage.getItem("pd-ascent-mute") === "1"; } catch {}
  let master = null, noiseBuf = null;
  function closeAudio() { clearTimeout(audio.t); const a = ac; ac = null; master = null; noiseBuf = null; if (a) { try { a.close(); } catch {} } }
  function audio() {
    if (muted) return null;
    try {
      try { if (navigator.audioSession) navigator.audioSession.type = "ambient"; } catch {}
      ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume();
      clearTimeout(audio.t); audio.t = setTimeout(closeAudio, 1500); // shut audio fully when quiet: iPhone Safari keeps a floating player while a context exists
      if (!master) { master = ac.createGain(); master.gain.value = .9; master.connect(ac.destination); }
      if (!noiseBuf) { noiseBuf = ac.createBuffer(1, ac.sampleRate * .6, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      return ac;
    } catch { return null; }
  }
  function tone(f, d = .08, type = "square", g = .05, slide = 0, at = 0) {
    const a = audio(); if (!a) return;
    try {
      const o = a.createOscillator(), v = a.createGain(), n = a.currentTime + at;
      o.type = type; o.frequency.setValueAtTime(f, n); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), n + d);
      v.gain.setValueAtTime(g, n); v.gain.exponentialRampToValueAtTime(.0001, n + d);
      o.connect(v).connect(master); o.start(n); o.stop(n + d + .02);
    } catch {}
  }
  /* filtered noise burst: hiss, swoosh, rumble */
  function noise(d = .12, g = .06, ftype = "highpass", f0 = 2000, f1 = 0, at = 0) {
    const a = audio(); if (!a) return;
    try {
      const src = a.createBufferSource(), fl = a.createBiquadFilter(), v = a.createGain(), n = a.currentTime + at;
      src.buffer = noiseBuf; fl.type = ftype; fl.frequency.setValueAtTime(f0, n); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, n + d); fl.Q.value = ftype === "bandpass" ? 2.5 : .7;
      v.gain.setValueAtTime(g, n); v.gain.exponentialRampToValueAtTime(.0001, n + d);
      src.connect(fl).connect(v).connect(master); src.start(n); src.stop(n + d + .02);
    } catch {}
  }
  const SFX = {
    spikeWarn: (k) => tone(1400, .03, "square", .018 * k),
    spikeUp: (k) => { noise(.09, .07 * k, "highpass", 3500); tone(1800, .07, "square", .03 * k, 900); },
    bladeSwish: (k) => noise(.22, .09 * k, "bandpass", 600, 3200),
    ghost: (k) => { tone(330, .32, "triangle", .05 * k, -120); tone(495, .32, "sine", .025 * k, -180, .04); },
    boulder: (k) => { noise(.3, .12 * k, "lowpass", 420, 120); tone(70, .3, "triangle", .08 * k, -25); },
    roll: (k) => noise(.12, .05 * k, "lowpass", 260),
    hit: { spike: () => { noise(.18, .12, "highpass", 2400); tone(240, .25, "sawtooth", .06, -170); },
           blade: () => { noise(.16, .12, "bandpass", 3000, 900); tone(520, .2, "square", .05, -380); },
           ghost: () => { tone(620, .5, "triangle", .07, -480); tone(930, .5, "sine", .03, -700, .05); },
           boulder: () => { noise(.35, .18, "lowpass", 300, 80); tone(90, .35, "square", .07, -50); },
           monster: () => { noise(.4, .16, "lowpass", 500, 90); tone(110, .45, "sawtooth", .08, -60); } },
    poster: () => { tone(880, .07, "square", .04); tone(1320, .11, "square", .04, 0, .07); },
    power: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .1, "square", .045, 0, i * .07)); },
    sword: () => { noise(.25, .08, "bandpass", 1200, 5000); [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .12, "square", .045, 0, i * .07)); },
    slay: () => { noise(.2, .12, "bandpass", 4000, 800); tone(196, .4, "sawtooth", .07, -120, .05); },
    roar: (k) => { noise(.35, .08 * k, "lowpass", 380, 120); tone(85, .35, "sawtooth", .05 * k, -30); }
  };
  /* hazards near the climber make their sounds when they change (spikes pop up, blades swing through, ghosts drift, boulders roll) */
  const hzPrev = new WeakMap();
  function hazardSounds(now) {
    if (muted) return;
    const fNow = Math.floor(sp / F);
    for (let m = Math.max(0, fNow - 1); m <= fNow + 1; m++) for (const h of floorData(m).hz) {
      const st = state(h, t), pos = h.t === "ghost" || h.t === "boulder" ? st.s : h.k + .5, dist = Math.abs(sp - pos);
      if (dist > 9) { hzPrev.delete(h); continue; }
      const k = Math.max(.15, 1 - dist / 9), p = hzPrev.get(h) || {};
      if (h.t === "spike") { if (st.warn && !p.warn) SFX.spikeWarn(k); if (st.up && !p.up) SFX.spikeUp(k); hzPrev.set(h, { up: st.up, warn: st.warn }); }
      else if (h.t === "blade") { if (st.hot && !p.hot) SFX.bladeSwish(k); hzPrev.set(h, { hot: st.hot }); }
      else if (h.t === "monster") { if (slain.has(h)) continue; const due = (p.next || 0) <= now; if (due) { if (p.next) SFX.roar(k); hzPrev.set(h, { next: now + 1.6 + Math.random() * .8 }); } }
      else if (h.t === "ghost") { const due = (p.next || 0) <= now; if (due) { if (p.next) SFX.ghost(k); hzPrev.set(h, { next: now + 1.1 + Math.random() * .6 }); } }
      else if (h.t === "boulder") { if (st.live && !p.live) SFX.boulder(k); else if (st.live && (p.next || 0) <= now) { SFX.roll(k); } hzPrev.set(h, { live: st.live, next: st.live && (p.next || 0) <= now ? now + .28 : p.next }); }
    }
  }
  function setMuted(v) {
    muted = v; try { localStorage.setItem("pd-ascent-mute", v ? "1" : "0"); } catch {}
    const b = document.getElementById("gMute"); if (b) { b.setAttribute("aria-pressed", String(v)); b.setAttribute("aria-label", v ? "Turn sound on" : "Mute sound"); }
    if (master) master.gain.value = v ? 0 : .9;
  }



  /* ---------- the climber: boy or girl, long-sleeve tee or hoodie with a premade graphic, shorts or pants ---------- */
  const PICKS = ["g1", "g2", "g3", "g6", "g10"];
  const GRAPHICS = (window.SHOPV || []).filter(p => PICKS.includes(p.id)).map(p => ({ id: p.id, t: p.t, c: (p.cw && p.cw[0] && p.cw[0][0]) || "#d9d9d6" }));
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
  /* in 1-bit the garment's colour becomes a tone: dark garments get a patterned (dithered) fill, light ones a near-solid fill */
  function clothTone(hex) { const v = hexRGB(hex).split(",").map(Number), l = (v[0] * .3 + v[1] * .59 + v[2] * .11) / 255, k = Math.round((.6 + .38 * l) * 255); return `rgb(${k},${k},${k})`; }
  /* the sprite is drawn off-screen, then stamped with a 1-pixel bone outline so it reads against the dark scene */
  const sprC = document.createElement("canvas"), silC = document.createElement("canvas");
  function drawClimber(c, x, y, u, face, leg, lk, scale) {
    const bw = u * 12, bh = u * 17, pw = Math.ceil(bw * scale) + 4, ph = Math.ceil(bh * scale) + 4;
    if (sprC.width < pw || sprC.height < ph) { sprC.width = silC.width = Math.max(sprC.width, pw); sprC.height = silC.height = Math.max(sprC.height, ph); }
    const sc = sprC.getContext("2d"), lc = silC.getContext("2d");
    sc.setTransform(1, 0, 0, 1, 0, 0); sc.clearRect(0, 0, sprC.width, sprC.height);
    sc.setTransform(scale, 0, 0, scale, 2, 2); drawClimberRaw(sc, bw / 2, bh - u * .2, u, face, leg, lk);
    lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalCompositeOperation = "source-over"; lc.clearRect(0, 0, silC.width, silC.height); lc.drawImage(sprC, 0, 0);
    lc.globalCompositeOperation = "source-in"; lc.fillStyle = "#fff"; lc.fillRect(0, 0, silC.width, silC.height); lc.globalCompositeOperation = "source-over";
    const ox = x - bw / 2 - 2 / scale, oy = y - bh + u * .2 - 2 / scale, sw = sprC.width / scale, sh = sprC.height / scale, p = 1 / scale;
    for (const [dx, dy] of [[-p, 0], [p, 0], [0, -p], [0, p]]) c.drawImage(silC, ox + dx, oy + dy, sw, sh);
    c.drawImage(sprC, ox, oy, sw, sh);
  }
  function drawClimberRaw(c, x, y, u, face, leg, lk) {
    const g = GRAPHICS.find(q => q.id === lk.art) || { c: "#ccc" }, cloth = clothTone(g.c), skin = "#F3F1EC", hood = lk.top === "hood", girl = lk.g === "girl";
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
    const d = artScale(96, 132), w = prev.offsetWidth, h = prev.offsetHeight;
    if (prev.width !== Math.round(w * d)) { prev.width = Math.round(w * d); prev.height = Math.round(h * d); }
    const c = prev.getContext("2d", { willReadFrequently: true }); c.imageSmoothingEnabled = false; c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
    c.fillStyle = C.bg; c.fillRect(0, 0, w, h); c.fillStyle = C.line; c.beginPath(); c.ellipse(w / 2, h - 12, w * .3, 5, 0, 0, 7); c.fill();
    drawClimber(c, w / 2, h - 10, h / 15.5, 1, 0, look, d);
    bitmap(c, prev.width, prev.height);
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
    arts.innerHTML = GRAPHICS.map(g => `<button type="button" role="radio" data-id="${g.id}" aria-label="${g.t.replace(/"/g, "&quot;")}"><canvas width="30" height="30"></canvas></button>`).join("");
    arts.querySelectorAll("button").forEach(b => {
      const g = GRAPHICS.find(q => q.id === b.dataset.id), cvs = b.querySelector("canvas"), c = cvs.getContext("2d", { willReadFrequently: true });
      const paint = () => { c.fillStyle = clothTone(g.c); c.fillRect(0, 0, 30, 30); const im = art(g.id); if (im && im.ok) { const k = Math.min(24 / im.naturalWidth, 24 / im.naturalHeight); c.drawImage(im, 15 - im.naturalWidth * k / 2, 15 - im.naturalHeight * k / 2, im.naturalWidth * k, im.naturalHeight * k); } bitmap(c, 30, 30); };
      paint(); const im = art(g.id); if (im && !im.ok) im.addEventListener("load", paint);
    });
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

  /* ---------- floor 20 reward: 20% off the next project. Earned once per browser; the code is kept so it can be claimed later
     from the title card. "Claim" opens a form (live.js pdOpenReward) that sends the code to the studio inbox. ---------- */
  const REWARD_FLOOR = 20; let rewardOn = false;
  const rewardCode = () => { try { return localStorage.getItem("pd-ascent-reward") || ""; } catch { return ""; } };
  function newCode() { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c = ""; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; return "PDG20-" + c; }
  function showClaimLink() { if (ui.claim) ui.claim.hidden = !rewardCode(); }
  function showReward() {
    if (!ui.reward) return;
    const code = newCode(); try { localStorage.setItem("pd-ascent-reward", code); } catch {}
    $("#gRwCode").textContent = code;
    const cf = ui.reward.querySelector(".gr-confetti"); cf.innerHTML = Array.from({ length: 26 }, (_, i) => `<i style="left:${(i * 37 + 7) % 100}%;--dx:${(i % 5 - 2) * 14}px;animation-duration:${2.2 + (i % 7) * .35}s;animation-delay:${-(i % 9) * .3}s"></i>`).join("");
    rewardOn = true; holdDir = keyDir = 0; pending = 0; power = Math.max(power, 3);
    ui.reward.hidden = false; showClaimLink();
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i > 4 ? .22 : .1, "square", .05, 0, i * .09));
    try { navigator.vibrate && navigator.vibrate([30, 40, 30, 40, 60]); } catch {}
    try { window.gtag && gtag("event", "game_reward", { floor: REWARD_FLOOR }); } catch {}
    setTimeout(() => { try { $("#gRwClaim").focus({ preventScroll: true }); } catch {} }, 400);
  }
  function hideReward() { if (ui.reward) ui.reward.hidden = true; rewardOn = false; }
  function claimReward() { const code = rewardCode(); hideReward(); if (playing) exit(); if (window.pdOpenReward) window.pdOpenReward(code, REWARD_FLOOR); }
  if (ui.reward) { $("#gRwLater").addEventListener("click", () => { hideReward(); try { crank.focus({ preventScroll: true }); } catch {} }); $("#gRwClaim").addEventListener("click", claimReward); }
  if (ui.claim) ui.claim.addEventListener("click", claimReward);
  showClaimLink();

  /* ---------- run control ---------- */
  function start() {
    playing = true; jumpT = 0; sp = .5; camH = 0; camA = .5; cp = 0; falls = 0; dead = 0; invul = 1; pending = 0; t = 0; lastStep = 0; got = 0; power = 0; sword = false; slashT = 0; taken.clear(); slain.clear();
    screenEl.classList.add("gaming"); document.documentElement.classList.add("pd-gaming"); ui.title.hidden = true; hud(); banner("Floor 01", "Turn the dial up to climb");
    tone(523, .09); setTimeout(() => tone(784, .12), 90);
    crank.focus({ preventScroll: true });
  }
  function exit() {
    closeAudio();
    playing = false; holdDir = keyDir = 0; pending = 0;
    hideReward(); showClaimLink();
    screenEl.classList.remove("gaming"); document.documentElement.classList.remove("pd-gaming"); if (pick) pick.hidden = true; ui.title.hidden = false; hud();
    try { rail.focus({ preventScroll: true }); } catch {}
  }
  function die(kind) {
    if (dead || invul > 0 || power > 0) return;
    dead = .95; falls++; shake = 1; pending = 0; hud();
    (SFX.hit[kind] || (() => tone(220, .25, "sawtooth", .06, -160)))();
    try { navigator.vibrate && navigator.vibrate(40); } catch {}
  }
  /* every poster makes you invincible: 5s below floor 10, then a random 1–5s from floor 10 up (where the monster starts; fl is 0-based).
     A new poster never cuts short time you already have. The ninth also gives the sword. */
  const powerFor = fl => fl < 9 ? 5 : 1 + Math.floor(Math.random() * 5);
  function collect(id) {
    const fl = Math.floor(id / 10), add = powerFor(fl);
    taken.add(id); got++; SFX.poster(); power = Math.max(power, add);
    if (got === 9) { sword = true; SFX.sword(); banner("Sword unlocked", `Walk into the monster to cut it down · ${add}s invincible`); }
    else { SFX.power(); banner(`${add}s invincible`, got < 9 ? `Poster ${got} · ${9 - got} to the sword` : `Poster ${got}`); }
    hud();
  }
  ui.start.addEventListener("click", openPick);
  ui.exit.addEventListener("click", exit);
  { const qt = document.getElementById("gQuitTop"); if (qt) qt.addEventListener("click", exit);
    const mb = document.getElementById("gMute"); if (mb) { setMuted(muted); mb.addEventListener("click", () => { setMuted(!muted); if (!muted) tone(660, .06); }); } }
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
  /* posters: portfolio graphics hung on the tower wall every other floor (dithered with everything else) */
  let posters = null, posterOff = 0;
  function posterList() {
    if (!posters) { posters = (window.PD_POSTERS || []).map(p => ({ src: p.src, t: p.t, im: null })); posterOff = Math.floor(Math.random() * Math.max(1, posters.length)); }
    return posters;
  }
  /* one poster on every floor, plus a second one on floors 2, 5 and 8: 12 to grab before the monster on floor 10, so 9 (the sword) is always in reach */
  const posterCache = new Map();
  function posterKs(n) {
    if (posterCache.has(n)) return posterCache.get(n);
    const doors = floorData(n).doors, out = [];
    /* above floor 10 posters thin out: every 2nd floor, then every 3rd (from floor 20), every 4th (30), at most every 5th */
    const gap = n < 9 ? 1 : Math.min(5, 2 + Math.floor((n - 9) / 10));
    if (gap > 1 && (n - 9) % gap !== 0) { posterCache.set(n, out); return out; }
    for (const base of (n < 9 && n % 3 === 1) ? [9, 18] : [13]) {
      let k = L0(n) + base;
      for (let tries = 0; tries < 10 && doors.some(d => Math.abs(d - k) < 2); tries++) k += 1;
      out.push(k);
    }
    posterCache.set(n, out); return out;
  }
  function drawPoster(n) { posterKs(n).forEach((k, j) => drawPosterAt(n, j, k)); }
  function drawPosterAt(n, j, k) {
    const list = posterList(); if (!list.length) return;
    if (playing && taken.has(n * 10 + j)) return;
    const [x, y, c] = P(k + .5, k, TR); if (c < .22) return;
    const p = list[(n * 2 + j + posterOff) % list.length];
    if (!p.im) { p.im = new Image(); p.im.crossOrigin = "anonymous"; p.im.decoding = "async"; p.im.src = p.src; }
    const ok = p.im.complete && p.im.naturalWidth > 0;
    const ar = ok ? Math.min(1.25, Math.max(.62, p.im.naturalWidth / p.im.naturalHeight)) : .72;
    const ph = Math.min(RISE * 7.5, TR * 1.25), w = ph * ar * c, top = y - RISE * 4.8 - ph, b = Math.max(2, 3 * c);
    ctx.fillStyle = C.ink; ctx.fillRect(x - w / 2 - b, top - b, w + b * 2, ph + b * 2);
    if (ok) ctx.drawImage(p.im, x - w / 2, top, w, ph); else { ctx.fillStyle = C.surface; ctx.fillRect(x - w / 2, top, w, ph); }
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x, top - b * .2, Math.max(1.6, 2.4 * c), 0, 7); ctx.fill();
    if (c > .6 && p.t) {
      ctx.save(); ctx.translate(x, top + ph + b + 9); ctx.scale(c, 1);
      ctx.font = `500 8px "IBM Plex Mono", ui-monospace, monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const label = p.t.toUpperCase(), tw = Math.min(ctx.measureText(label).width, w / c + 20);
      ctx.fillStyle = C.bg; ctx.fillRect(-tw / 2 - 4, -6, tw + 8, 12);
      ctx.fillStyle = C.ink; ctx.fillText(label, 0, 0, w / c + 20); ctx.restore();
    }
  }
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
  /* the monster (floor 10 and up): a horned brute that paces the stair. Jump it, wait out a power-up, or cut it down with the sword */
  function drawMonster(s, now, h) {
    const [x, y, c] = P(s, Math.floor(s), rMid()); if (c < .05) return;
    const u = SW * .17 * Math.max(.55, c), st = Math.sin(now * 7 + h.ph * 4), dir = Math.cos(Math.PI * (t * h.v / (h.b - h.a) + h.ph)) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = C.ink;
    ctx.fillRect(-u * 2.3, -u * 1.6 + Math.max(0, st) * u * .5, u * 1.5, u * 1.6); ctx.fillRect(u * .8, -u * 1.6 + Math.max(0, -st) * u * .5, u * 1.5, u * 1.6);
    rr(ctx, -u * 3.4, -u * 9.2, u * 6.8, u * 7.8, u * 2.4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-u * 2.6, -u * 8.6); ctx.lineTo(-u * 4.1, -u * 11.6); ctx.lineTo(-u * 1.2, -u * 9); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(u * 2.6, -u * 8.6); ctx.lineTo(u * 4.1, -u * 11.6); ctx.lineTo(u * 1.2, -u * 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.bg; rr(ctx, -u * 2.8, -u * 8.6, u * 5.6, u * 6.6, u * 1.9); ctx.fill();
    ctx.fillStyle = C.ink; const blink = (now + h.ph) % 3 < .12;
    ctx.fillRect(-u * .4, -u * 7, u * 1.3, blink ? u * .25 : u * 1.2); ctx.fillRect(u * 1.5, -u * 7, u * 1.1, blink ? u * .25 : u * 1.2);
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1, u * .35); ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const mx = -u * 1.8 + i * u * .75, my = -u * 4.6 + (i % 2 ? u * .7 : 0); i ? ctx.lineTo(mx, my) : ctx.moveTo(mx, my); } ctx.stroke();
    ctx.fillStyle = C.ink; const arm = st * u * .8;
    rr(ctx, u * 3.1, -u * 6.6 + arm, u * 1.4, u * 3.6, u * .6); ctx.fill(); rr(ctx, -u * 4.5, -u * 6.6 - arm, u * 1.4, u * 3.6, u * .6); ctx.fill();
    ctx.restore();
  }
  function drawSword(x, y, u, now) {
    const sw = slashT > 0 ? (1 - slashT / .35) : 0, ang = (-.55 + sw * 2.4) * face;
    ctx.save(); ctx.translate(x + face * u * 3, y - u * 7.2); ctx.rotate(ang);
    ctx.fillStyle = C.accentInk; ctx.fillRect(-u * .9, -u * 1.05, u * 1.8, u * 2.1);
    ctx.fillStyle = C.ink; ctx.fillRect(-u * .55, -u * 9.5, u * 1.1, u * 8.6);
    ctx.beginPath(); ctx.moveTo(-u * .55, -u * 9.5); ctx.lineTo(0, -u * 10.8); ctx.lineTo(u * .55, -u * 9.5); ctx.closePath(); ctx.fill();
    ctx.fillRect(-u * 1.9, -u * 1.25, u * 3.8, u * .7); ctx.fillRect(-u * .4, -u * .55, u * .8, u * 1.9);
    ctx.restore();
    if (slashT > 0) { ctx.strokeStyle = C.ink; ctx.globalAlpha = slashT / .35; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + face * u * 3, y - u * 7, u * 10, -Math.PI * .5 - .9 * face, -Math.PI * .5 + 1.3 * face, face < 0); ctx.stroke(); ctx.globalAlpha = 1; }
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
    const u = SW * .09, fr = sp - Math.floor(sp), walk = Math.abs(pending) > .02 || holdDir || keyDir;
    ctx.save();
    if (dead) { ctx.globalAlpha = Math.max(0, dead); ctx.translate(x, y - u * 4); ctx.rotate((1 - dead) * 3 * -face); ctx.translate(-x, -(y - u * 4)); y -= (1 - dead) * u * 10; }
    if (invul > 0 && !dead && Math.floor(now * 14) % 2) ctx.globalAlpha = .45;
    if (power > 0 && !dead) ctx.globalAlpha = power < 2.5 && Math.floor(now * 8) % 2 ? .8 : .5;
    if (hide) ctx.globalAlpha *= .7;
    const leg = walk ? Math.sin(fr * Math.PI * 2) * u * 1.2 : 0;
    drawClimber(ctx, x, y, u, face, leg, look, dpr);
    if (sword && playing && !hide) drawSword(x, y, u, now);
    ctx.restore();
    if (dead) { ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.globalAlpha = dead; ctx.beginPath(); ctx.arc(x, y - u * 6, (1 - dead) * SW, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
  }


  /* ---------- sky: the higher you climb, the ground gives way to night clouds, then stars and the moon ---------- */
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const SKY = (() => { const r = rng(4242), clouds = [], stars = [];
    for (let i = 0; i < 26; i++) clouds.push({ h: 18 + i * 13 + r() * 8, x: r(), w: .5 + r() * .7, puffs: Array.from({ length: 4 + Math.floor(r() * 3) }, () => [r() * 2 - 1, r() * .6, .35 + r() * .45]) });
    for (let i = 0; i < 170; i++) stars.push({ x: r(), y: r(), big: r() < .12, tw: r() * 6 });
    return { clouds, stars }; })();
  function drawSky(now) {
    const alt = camH / F, px = 1 / dpr;
    // stars (fade in from about floor 4, all out by floor 7)
    const starA = clamp01((alt - 3.5) / 3);
    if (starA > 0) {
      const n = Math.floor(SKY.stars.length * starA);
      ctx.fillStyle = "#fff";
      for (let i = 0; i < n; i++) {
        const st = SKY.stars[i]; if (!st.big && Math.sin(now * 2 + st.tw) > .92) continue;
        const y = ((st.y * H * 1.6 + camH * RISE * .06) % (H * 1.6)) - H * .3, x = st.x * W;
        const sz = st.big ? px * 2 : px; ctx.fillRect(x, y, sz, sz);
        if (st.big && Math.sin(now * 1.3 + st.tw) > .6) { ctx.fillRect(x - px * 2, y + px * .5, px * 6, px); ctx.fillRect(x + px * .5, y - px * 2, px, px * 6); }
      }
    }
    // moon (from about floor 8)
    const moonA = clamp01((alt - 7) / 2);
    if (moonA > 0) {
      const mr = Math.min(W, H) * .07, mx = cx + Math.min(W * .3, TR * 2.6), my = H * .2 + (1 - moonA) * H * .3;
      ctx.fillStyle = "#e6e6e6"; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 7); ctx.fill();
      ctx.fillStyle = "#9a9a9a"; [[-.35, -.2, .22], [.3, .25, .16], [.05, .45, .1], [.4, -.35, .09]].forEach(([a, b, c]) => { ctx.beginPath(); ctx.arc(mx + a * mr, my + b * mr, c * mr, 0, 7); ctx.fill(); });
    }
    // night clouds (from about floor 1, thinning out by floor 9)
    const cloudA = clamp01((alt - .4) / 1.2) * clamp01((10 - alt) / 2.5);
    if (cloudA > 0) {
      ctx.save(); ctx.globalAlpha = cloudA;
      for (const c of SKY.clouds) {
        const y = py0 - (c.h - camH) * RISE * .45; if (y < -H * .3 || y > H * 1.3) continue;
        const x = c.x * W, w = c.w * Math.max(W * .22, 120);
        for (const [dx, dy, r] of c.puffs) { ctx.fillStyle = "#6e6e6e"; ctx.beginPath(); ctx.ellipse(x + dx * w * .6, y + dy * w * .2, w * r * .55, w * r * .32, 0, 0, 7); ctx.fill(); }
        for (const [dx, dy, r] of c.puffs) { ctx.fillStyle = "#9c9c9c"; ctx.beginPath(); ctx.ellipse(x + dx * w * .6, y + dy * w * .2 - w * r * .1, w * r * .4, w * r * .2, 0, 0, 7); ctx.fill(); }
      }
      ctx.restore();
    }
  }

  window.PD_ASCENT_JUMPTO = (v) => { sp = v; camA = v; camH = footH(v); cp = Math.floor(v / F); invul = 3; };
  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    drawSky(now);
    if (shake > 0 && !reduced) ctx.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 8 * shake);
    const lo = Math.floor(camH - (H - py0) / RISE - 4), hi = Math.ceil(camH + py0 / RISE + 4);
    const i0 = Math.max(0, lo), i1 = hi;
    // ground
    const gy = py0 - (0 - camH) * RISE;
    if (gy < H + TR) { ctx.fillStyle = C.ground; ctx.beginPath(); ctx.ellipse(cx, gy + RISE, W, TR * TILT * 2.2, 0, Math.PI, 0); ctx.lineTo(W * 2, H * 2); ctx.lineTo(-W, H * 2); ctx.closePath(); ctx.fill(); ctx.fillRect(-W, gy + RISE, W * 3, H); }
    const front = [], backs = [];
    for (let i = i0; i <= i1; i++) { const c = Math.cos((i + .5 - camA) * K); (c < 0 ? backs : front).push([i, c]); }
    backs.forEach(([i]) => drawStep(i, true));
    drawTower(lo, hi);
    const fl = Math.floor(Math.max(0, camA) / F);
    for (let n = Math.max(0, fl - 2); n <= fl + 2; n++) {
      drawPoster(n);
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
        else if (h.t === "monster" && !(playing && slain.has(h))) drawMonster(st.s, now, h);
      }
    }
    drawPlayer(now);
    bitmap(ctx, cv.width, cv.height);
  }

  /* ---------- update ---------- */
  function update(dt, now) {
    t += dt;
    if (!playing) { // attract mode: the fool wanders up on his own
      sp += dt * 1.4; if (sp > F * 3) sp = .5;
      camA += (sp - camA) * Math.min(1, dt * 8); camH += (footH(sp) - camH) * Math.min(1, dt * 6); face = 1;
      return;
    }
    if (rewardOn) { /* paused on the floor 20 reward card */ }
    else if (dead > 0) {
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
      invul = Math.max(0, invul - dt); jumpT = Math.max(0, jumpT - dt); slashT = Math.max(0, slashT - dt);
      if (power > 0) { power = Math.max(0, power - dt); if (!power) { banner("Power-up over", "Careful again"); tone(392, .12, "square", .04, -120); } }
      { const pn = Math.floor(sp / F);
        posterKs(pn).forEach((pk, j) => { if (!taken.has(pn * 10 + j) && airborne() && Math.abs(sp - (pk + .5)) < 1) collect(pn * 10 + j); }); }
      const n = Math.floor(sp / F);
      if (n > cp && sp - L0(n) > .5) {
        cp = n; if (cp + 1 > best) { best = cp + 1; try { localStorage.setItem("pd-ascent-best", best); } catch {} }
        const next = floorData(n), tip = next.doors.length ? "Boulders ahead — jump them or duck into doorways" : n === 1 ? "Ghosts: jump over them" : n === 2 ? "Blades: go when they swing away — jumping won't help" : "";
        const tip2 = n === 9 ? (sword ? "A monster! Walk into it with your sword" : "A monster! Jump it, or get 9 posters for the sword") : tip;
        banner(`Floor ${String(cp + 1).padStart(2, "0")}`, tip2); tone(659, .1); setTimeout(() => tone(988, .16), 100);
        if (cp + 1 === REWARD_FLOOR && !rewardCode()) showReward();
      }
      // collisions
      if (sword) { const fNow = Math.floor(sp / F);
        for (let m = Math.max(0, fNow - 1); m <= fNow + 1; m++) for (const h of floorData(m).hz)
          if (h.t === "monster" && !slain.has(h) && Math.abs(sp - state(h, t).s) < 1.1) { slain.add(h); slashT = .35; shake = .6; SFX.slay(); banner("Monster down!", "Keep climbing"); try { navigator.vibrate && navigator.vibrate(25); } catch {} } }
      if (!invul && !power) {
        const fNow = Math.floor(sp / F);
        for (let m = Math.max(0, fNow - 1); m <= fNow + 1 && !dead; m++) for (const h of floorData(m).hz) {
          const st = state(h, t);
          if (h.t === "spike" && st.up && !airborne() && Math.abs(sp - (h.k + .5)) < .48) die("spike");
          else if (h.t === "blade" && st.hot && Math.abs(sp - (h.k + .5)) < .6) die("blade");
          else if (h.t === "ghost" && !airborne() && Math.abs(sp - st.s) < .48) die("ghost");
          else if (h.t === "boulder" && st.live && Math.abs(sp - st.s) < .62 && !inDoor(sp) && !airborne()) die("boulder");
          else if (h.t === "monster" && !slain.has(h) && Math.abs(sp - st.s) < .7 && !(airborne() && air() > .55)) die("monster");
          if (dead) break;
        }
      }
      hud();
      hazardSounds(now);
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
  document.addEventListener("visibilitychange", () => { if (document.hidden) closeAudio(); });
  document.addEventListener("visibilitychange", () => { if (active && !document.hidden && !raf) { last = 0; raf = requestAnimationFrame(frame); } });
  window.addEventListener("pdtheme", readColors);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => setTimeout(readColors, 30));
  setActive(screenEl.classList.contains("sec-play"));
  hud();
  window.pdAscent = { jump, ghost: () => { for (const h of floorData(Math.floor(sp / F)).hz) if (h.t === "ghost") return state(h, t).s; return null; }, start, exit, get s() { return sp; }, set s(v) { sp = v; camA = v; }, get falls() { return falls; }, get posters() { return got; }, set posters(v) { got = v; }, get power() { return power; }, set power(v) { power = v; }, collect, get sword() { return sword; }, showReward, get rewardOn() { return rewardOn; }, get floor() { return cp + 1; } };
})();
