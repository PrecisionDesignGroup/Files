/* ---------- Black Friday weekend (temporary): drop a coin through the pegs, the slot it lands in is your discount ----------
   Shows from SALE_START to SALE_END (ET); after that the dial button and panel remove themselves, so nothing needs undoing.
   ?sale=1 forces it on for previews. One coin per browser (localStorage "pd-sale-drop"); a win opens a claim form
   (live.js pdOpenSaleClaim) that sends the code to the studio's Webflow inbox. The jog dial nudges the coin left and right. */
(function () {
  const panel = document.querySelector('[data-panel="sale"]'); if (!panel) return;
  const SALE_END = new Date("2026-12-01T00:00:00-05:00").getTime();
  const force = /[?&]sale=1/.test(location.search);
  if (Date.now() > SALE_END && !force) return; /* the boot code already removed the section */

  const $ = s => panel.querySelector(s);
  const cv = $("#saleBoard"), ctx = cv.getContext("2d"), wrap = $(".sl-board");
  const dropBtn = $("#saleDrop"), msg = $("#saleMsg"), res = $("#saleRes");
  /* prizes, left to right. Pegs make the middle most likely and the edges rarest */
  const SLOTS = [80, 60, 0, 40, 30, 20, 30, 40, 0, 60, 80];
  const BW = 110, BH = 124, ROWS = 10, ROW0 = 15, RS = 8.4, PEG = 1.15, R = 3.1, SLOT_TOP = ROW0 + (ROWS - 1) * RS + 7, G = 620;
  const AIM_LO = 42, AIM_HI = 68, aimX = x => Math.max(AIM_LO, Math.min(AIM_HI, x)); /* the coin can only go in over the middle */
  const pegs = [];
  for (let r = 0; r < ROWS; r++) { const odd = r % 2; for (let k = 0; k < (odd ? 11 : 10); k++) pegs.push({ x: odd ? 5 + 10 * k : 10 + 10 * k, y: ROW0 + r * RS, hit: 0 }); }

  let saved = null; try { saved = JSON.parse(localStorage.getItem("pd-sale-drop") || "null"); } catch (_) {}
  let coin = { x: 55, y: 5, vx: 0, vy: 0, a: 0 }, state = saved ? "done" : "aim", swing = 0, swingOn = true, landed = saved ? saved.slot : -1, flash = 0, sc = 3, raf = 0, last = 0;
  if (saved) { coin.x = saved.slot * 10 + 5; coin.y = BH - R - 1; }

  /* sound: tiny chip ticks, made only after a tap */
  let ac = null, acT = 0;
  function tone(f, d, type = "square", v = .03, delay = 0) {
    try { if (!ac) { if (navigator.audioSession) navigator.audioSession.type = "ambient"; ac = new (window.AudioContext || window.webkitAudioContext)(); }
      clearTimeout(acT); acT = setTimeout(() => { try { ac && ac.close(); } catch (_) {} ac = null; }, 2500);
      const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + .02);
    } catch (_) {}
  }

  const css = n => getComputedStyle(panel).getPropertyValue(n).trim();
  function size() {
    const w = wrap.clientWidth, h = wrap.clientHeight; if (!w || !h) return;
    sc = Math.min(w / BW, h / BH); const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.style.width = BW * sc + "px"; cv.style.height = BH * sc + "px"; cv.width = Math.round(BW * sc * dpr); cv.height = Math.round(BH * sc * dpr);
    ctx.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0); draw();
  }
  new ResizeObserver(size).observe(wrap);

  function draw() {
    const ink = css("--ink") || "#111", soft = css("--ink-soft") || "#777", line = css("--line") || "rgba(0,0,0,.15)", acc = "#F2C649";
    ctx.clearRect(0, 0, BW, BH);
    /* drop zone */
    ctx.fillStyle = soft; for (let x = AIM_LO - R; x < AIM_HI + R; x += 2.4) ctx.fillRect(x, 10.2, 1.2, .3); ctx.fillRect(AIM_LO - R - .3, 8.6, .3, 1.9); ctx.fillRect(AIM_HI + R, 8.6, .3, 1.9);
    /* pegs */
    for (const p of pegs) { ctx.beginPath(); ctx.arc(p.x, p.y, PEG + p.hit * .9, 0, 7); ctx.fillStyle = p.hit > .05 ? acc : ink; ctx.fill(); p.hit *= .9; }
    /* slots */
    for (let i = 0; i < SLOTS.length; i++) {
      const x = i * 10, on = i === landed;
      if (on) { ctx.fillStyle = acc; ctx.globalAlpha = .35 + .35 * Math.abs(Math.sin(flash * 6)); ctx.fillRect(x + .5, SLOT_TOP, 9, BH - SLOT_TOP); ctx.globalAlpha = 1; }
      ctx.save(); ctx.translate(x + 5, BH - 4.5); ctx.rotate(-Math.PI / 2);
      ctx.font = `700 ${SLOTS[i] ? 4.6 : 3.3}px "Big Shoulders Display", "IBM Plex Mono", monospace`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = SLOTS[i] ? (on ? ink : SLOTS[i] >= 60 ? ink : soft) : soft; ctx.fillText(SLOTS[i] ? SLOTS[i] + "% OFF" : "NO LUCK", 0, 0); ctx.restore();
    }
    ctx.fillStyle = ink; for (let i = 0; i <= SLOTS.length; i++) ctx.fillRect(i * 10 - .35, SLOT_TOP, .7, BH - SLOT_TOP);
    ctx.fillRect(0, BH - .7, BW, .7);
    /* coin */
    ctx.save(); ctx.translate(coin.x, coin.y); ctx.rotate(coin.a);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fillStyle = "#E3B23C"; ctx.fill(); ctx.lineWidth = .45; ctx.strokeStyle = "#8A6514"; ctx.stroke();
    ctx.lineWidth = .32; ctx.strokeStyle = "#8A6514"; [2.15, 1.35].forEach(r => { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke(); });
    ctx.beginPath(); ctx.arc(0, 0, .5, 0, 7); ctx.fillStyle = "#8A6514"; ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.arc(-1.1, -1.2, .55, 0, 7); ctx.fill();
    ctx.restore();
  }

  function step(dt) {
    if (state === "aim") { if (swingOn) { swing += dt * 1.6; coin.x = 55 + Math.sin(swing) * 13; } coin.y = 5 + Math.sin(swing * 3) * .25; return; }
    if (state !== "fall") return;
    coin.vy += G * dt; coin.x += coin.vx * dt; coin.y += coin.vy * dt; coin.a += coin.vx * dt / R;
    for (const p of pegs) {
      const dx = coin.x - p.x, dy = coin.y - p.y, d = Math.hypot(dx, dy), m = R + PEG;
      if (d < m && d > 0) {
        const nx = dx / d, ny = dy / d; coin.x = p.x + nx * m; coin.y = p.y + ny * m;
        const vn = coin.vx * nx + coin.vy * ny;
        if (vn < 0) { coin.vx -= 1.55 * vn * nx; coin.vy -= 1.55 * vn * ny; coin.vx += (Math.random() - .5) * 16; if (p.hit < .3) tone(700 + p.y * 9, .04, "square", .018); p.hit = 1; }
        if (Math.abs(nx) < .12) coin.vx += (Math.random() < .5 ? -1 : 1) * 22; /* never balance on a peg top */
      }
    }
    if (coin.x < R) { coin.x = R; coin.vx = Math.abs(coin.vx) * .5; } if (coin.x > BW - R) { coin.x = BW - R; coin.vx = -Math.abs(coin.vx) * .5; }
    if (coin.y > SLOT_TOP - R) { /* inside the slots: dividers are walls */
      const i = Math.max(0, Math.min(SLOTS.length - 1, Math.floor(coin.x / 10))), lo = i * 10 + R + .35, hi = i * 10 + 10 - R - .35;
      if (coin.y > SLOT_TOP + 1) { if (coin.x < lo) { coin.x = lo; coin.vx = Math.abs(coin.vx) * .4; } if (coin.x > hi) { coin.x = hi; coin.vx = -Math.abs(coin.vx) * .4; } }
      if (coin.y > BH - R - .7) { coin.y = BH - R - .7; if (Math.abs(coin.vy) > 40) { tone(220, .06, "triangle", .05); coin.vy *= -.3; } else { coin.vy = 0; coin.vx *= .8; if (Math.abs(coin.vx) < 2) land(i); } }
    }
    const sp = Math.hypot(coin.vx, coin.vy); if (sp > 200) { coin.vx *= 200 / sp; coin.vy *= 200 / sp; }
  }

  function loop(now) {
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    let k = Math.ceil(dt / (1 / 240)); const h = dt / Math.max(1, k); while (k-- > 0) step(h);
    if (landed >= 0) flash += dt;
    draw();
    raf = (state === "done" && flash > 3) || panel.hidden ? 0 : requestAnimationFrame(loop);
  }
  function run() { if (!raf && !panel.hidden) { last = 0; raf = requestAnimationFrame(loop); } }
  new MutationObserver(() => { if (!panel.hidden) { size(); run(); } }).observe(panel, { attributes: true, attributeFilter: ["hidden"] });

  function drop() {
    if (state !== "aim") return;
    state = "fall"; swingOn = false; coin.vx = (Math.random() - .5) * 6; coin.vy = 0;
    dropBtn.disabled = true; dropBtn.textContent = "Dropping…"; msg.textContent = "Here it goes…";
    tone(523, .08); tone(784, .1, "square", .03, .08);
    try { window.pdEv && pdEv("sale_drop", {}); } catch (_) {}
    run();
  }
  function code(p) { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c = ""; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; return `BF${p}-${c}`; }
  let simHit = null;
  function land(i) {
    if (simHit) { simHit.i = i; state = "simdone"; return; }
    if (state !== "fall") return; state = "done"; landed = i; flash = 0;
    const pct = SLOTS[i], s = { slot: i, pct, code: pct ? code(pct) : "", t: Date.now() };
    try { localStorage.setItem("pd-sale-drop", JSON.stringify(s)); } catch (_) {}
    saved = s; showResult(true);
    if (pct) [523, 659, 784, 1047, 1319].forEach((f, k) => tone(f, .14, "square", .035, k * .08)); else [392, 330, 262].forEach((f, k) => tone(f, .18, "triangle", .05, k * .14));
    try { navigator.vibrate && navigator.vibrate(pct ? [30, 40, 60] : 40); } catch (_) {}
    try { window.pdEv && pdEv("sale_result", { pct }); } catch (_) {}
  }
  function showResult(fresh) {
    const s = saved; if (!s) return;
    dropBtn.hidden = true; msg.hidden = true; res.hidden = false; res.classList.toggle("fresh", !!fresh);
    res.innerHTML = s.pct
      ? `<p class="sl-k">Your coin landed on</p><p class="sl-big"><span>${s.pct}%</span><span>off</span></p><p class="sl-sub">your next project with Precision Design</p>
         <p class="sl-code"><i>Your code</i><b>${s.code}</b></p><button class="sl-go" type="button" data-claim>Claim my ${s.pct}% off →</button>`
      : `<p class="sl-k">Your coin landed on</p><p class="sl-big sl-none"><span>No luck</span></p><p class="sl-sub">Not this time. Every new project is still on sale all weekend.</p>
         <button class="sl-go" type="button" data-start>Start a project →</button>`;
    const c = res.querySelector("[data-claim]"); if (c) c.addEventListener("click", () => window.pdOpenSaleClaim && pdOpenSaleClaim(s.pct, s.code));
    const st = res.querySelector("[data-start]"); if (st) st.addEventListener("click", () => window.pdOpenSaleClaim && pdOpenSaleClaim(0, ""));
  }

  /* aim: drag or tap on the board to move the coin, tap the button (or the board) to drop */
  let down = null;
  cv.addEventListener("pointerdown", ev => { if (state !== "aim") return; down = { x: ev.clientX, t: Date.now(), moved: false }; cv.setPointerCapture(ev.pointerId); });
  cv.addEventListener("pointermove", ev => { if (!down || state !== "aim") return; const r = cv.getBoundingClientRect(); if (Math.abs(ev.clientX - down.x) > 6) down.moved = true;
    if (down.moved) { swingOn = false; coin.x = aimX((ev.clientX - r.left) / sc); } });
  cv.addEventListener("pointerup", ev => { if (!down) return; const d = down; down = null; if (state !== "aim") return;
    const r = cv.getBoundingClientRect(); if (!d.moved) { swingOn = false; coin.x = aimX((ev.clientX - r.left) / sc); } tone(880, .03); });
  dropBtn.addEventListener("click", drop);
  window.pdSaleSim = n => { const keep = { ...coin }, st = state, hist = SLOTS.map(() => 0); let tt = 0;
    for (let k = 0; k < n; k++) { coin = { x: aimX(AIM_LO + Math.random() * (AIM_HI - AIM_LO)), y: 5, vx: (Math.random() - .5) * 6, vy: 0, a: 0 }; state = "fall"; let t = 0; simHit = { i: -1 };
      while (state === "fall" && t < 20) { step(1 / 240); t += 1 / 240; }
      if (simHit.i >= 0) hist[simHit.i]++; tt += t; }
    simHit = null; coin = keep; state = st; return { hist, avg: +(tt / n).toFixed(2) }; };
  window.pdSaleDbg = () => ({ state, x: +coin.x.toFixed(1), y: +coin.y.toFixed(1), landed, sc });
  window.pdSaleJog = d => { if (state !== "aim") return false; swingOn = false; coin.x = aimX(coin.x + d * 4); tone(880 + d * 60, .03); return true; };

  /* the three days: today's one lights up */
  const day = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", day: "numeric" }).format(new Date()) | 0;
  const on = day === 27 ? 0 : day === 28 ? 1 : day >= 29 && day <= 30 ? 2 : 0;
  panel.querySelectorAll(".sl-days span").forEach((s, i) => s.classList.toggle("on", i === on));
  const cd = $("#saleCd");
  function tick() { const l = Math.max(0, SALE_END - Date.now()), d = Math.floor(l / 864e5), h = Math.floor(l / 36e5) % 24, m = Math.floor(l / 6e4) % 60; cd.innerHTML = l ? `Ends in <b>${d}d ${h}h ${m}m</b>` : "Sale ended"; }
  tick(); setInterval(tick, 30000);

  if (saved) showResult(false);
  size(); run();
})();
