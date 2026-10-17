(function () {
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // icing drips along the top edge of each tier
  var drips = document.getElementById("drips");
  for (var x = 80; x <= 240; x += 20) el("circle", { cx: x, cy: 127, r: 9 }, drips);
  for (var x2 = 50; x2 <= 270; x2 += 20) {
    if (x2 > 62 && x2 < 258) continue;
    el("circle", { cx: x2, cy: 177, r: 9 }, drips);
  }
  for (var x3 = 60; x3 <= 260; x3 += 20) if (x3 <= 62 || x3 >= 258) continue;
  el("rect", { x: 40, y: 175, width: 240, height: 6, fill: "#fff1f6", rx: 3 }, drips);

  // five candles
  var candlesG = document.getElementById("candles");
  var candles = [];
  [90, 125, 160, 195, 230].forEach(function (cx, i) {
    var g = el("g", { "class": "candle", tabindex: 0, role: "button", "aria-label": "شمعة " + (i + 1) + "، اضغطي عشان تطفيها" }, candlesG);
    el("circle", { "class": "glow", cx: cx, cy: 80, r: 22, fill: "#ffc247", opacity: ".16" }, g);
    el("rect", { "class": "wax", x: cx - 5, y: 92, width: 10, height: 34, rx: 3, fill: i % 2 ? "#7fe3c4" : "#ffffff" }, g);
    el("path", { d: "M" + (cx - 5) + " 104 l10 -6 M" + (cx - 5) + " 114 l10 -6", stroke: i % 2 ? "#3c9f84" : "#ff7fa9", "stroke-width": 3, fill: "none" }, g);
    el("path", { "class": "flame", d: "M" + cx + " 66 C" + (cx + 9) + " 76 " + (cx + 7) + " 90 " + cx + " 90 C" + (cx - 7) + " 90 " + (cx - 9) + " 76 " + cx + " 66 Z", fill: "#ffc247" }, g);
    candles.push(g);
    g.addEventListener("click", function () { snuff(g); });
    g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); snuff(g); } });
  });

  var statusEl = document.getElementById("status");
  var blowBtn = document.getElementById("blow");
  var done = false;

  function snuff(g) {
    if (g.classList.contains("out")) return;
    g.classList.add("out");
    g.setAttribute("aria-label", "شمعة مطفية");
    check();
  }
  function check() {
    var left = candles.filter(function (c) { return !c.classList.contains("out"); }).length;
    if (left === 0 && !done) {
      done = true;
      blowBtn.textContent = "اتمنيتي؟";
      blowBtn.disabled = true;
      statusEl.textContent = "الشموع طفت. اتمني أمنية وماتقوليهاش لحد.";
      confetti();
    } else if (left > 0) {
      statusEl.textContent = "فاضل " + left + (left === 1 ? " شمعة" : left === 2 ? " شمعتين" : " شموع");
    }
  }
  blowBtn.addEventListener("click", function () {
    candles.forEach(function (c, i) { setTimeout(function () { snuff(c); }, reduce ? 0 : i * 140); });
  });

  // wish cards
  document.querySelectorAll(".wish").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-pressed") === "true";
      b.setAttribute("aria-pressed", open ? "false" : "true");
      b.querySelector(".front").hidden = !open;
      b.querySelector(".back").hidden = open;
      b.querySelector(".tag").hidden = !open;
    });
  });

  // confetti
  var cv = document.getElementById("fx"), ctx = cv.getContext("2d"), parts = [], raf = 0;
  function size() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
  size(); addEventListener("resize", size);
  function confetti() {
    if (reduce) return;
    var cols = ["#ffc247", "#ff7fa9", "#7fe3c4", "#f7effb"];
    for (var i = 0; i < 150; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .45,
        vx: (Math.random() - .5) * 11, vy: -Math.random() * 12 - 3,
        w: 5 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6,
        vr: (Math.random() - .5) * .3, c: cols[i % cols.length]
      });
    }
    cancelAnimationFrame(raf); tick();
  }
  function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    var d = devicePixelRatio;
    parts = parts.filter(function (p) { return p.y < innerHeight + 30; });
    parts.forEach(function (p) {
      p.vy += .28; p.vx *= .995; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x * d, p.y * d); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w * d / 2, -p.h * d / 2, p.w * d, p.h * d); ctx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, cv.width, cv.height);
  }
})();
