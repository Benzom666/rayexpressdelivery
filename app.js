/* RAY EXPRESS — shared interactions */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header: transparent over hero -> solid paper after scroll */
  var hdr = document.getElementById("hdr");
  var sticky = document.getElementById("stickyCta");
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle("solid", y > 40);
    if (sticky) {
      var past = y > window.innerHeight * 0.7;
      var nearEnd = window.innerHeight + y > document.body.scrollHeight - 560;
      sticky.classList.toggle("show", past && !nearEnd);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var burger = document.getElementById("burger");
  var mmenu = document.getElementById("mmenu");
  if (burger && mmenu) {
    burger.addEventListener("click", function () {
      var open = mmenu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mmenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mmenu.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* parallax on page-hero backgrounds */
  var pheroImg = document.querySelector(".phero img.bg");
  if (pheroImg && !reduced) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      if (y < window.innerHeight) pheroImg.style.transform = "translateY(" + y * 0.18 + "px)";
    }, { passive: true });
  }

  /* reveal on scroll */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  /* animated counters */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, end = parseFloat(el.dataset.count), t0 = null;
      if (reduced || isNaN(end)) { el.textContent = el.dataset.count; return; }
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  /* ---- tracking demo (tracking.html + home quick form) ---- */
  var DEMO = {
    "RX-88231": { eta: "Today · 2:32 PM", dest: "14 Harbor Street, Unit 9", status: "Out for delivery", scan: "Last scan 6:36 PM · Departed Depot East",
      steps: [["Order received", "8:02 AM · Sort lane 1", 1], ["Picked up", "9:14 AM · DC-East dock 4", 1], ["In transit", "12:40 PM · Linehaul 07", 1], ["Out for delivery", "1:55 PM · Courier K. Mensah", 2], ["Delivered", "ETA 2:32 PM", 0]] },
    "RX-10457": { eta: "Today · 5:10 PM", dest: "88 Market Row, Floor 2", status: "In transit", scan: "Last scan 6:21 PM · Arrived Hub 02",
      steps: [["Order received", "7:30 AM · Sort lane 2", 1], ["Picked up", "8:45 AM · DC-North dock 1", 1], ["In transit", "11:20 AM · Linehaul 03", 2], ["Out for delivery", "Scheduled 3:30 PM", 0], ["Delivered", "ETA 5:10 PM", 0]] },
    "RX-77120": { eta: "Tomorrow · 7–9 PM window", dest: "5 Cedar Court", status: "At depot", scan: "Last scan 5:58 PM · Sort lane 4",
      steps: [["Order received", "4:05 PM · Online booking", 1], ["Picked up", "5:10 PM · Retailer dock", 1], ["In transit", "Scheduled 6:00 AM tomorrow", 0], ["Out for delivery", "Window 7:00–9:00 PM", 0], ["Delivered", "Pending", 0]] }
  };
  var form = document.getElementById("trackForm");
  if (form) {
    var input = document.getElementById("tnum");
    var res = document.getElementById("tResult");
    var line = document.getElementById("tLine");
    /* prefill from ?n= */
    var q = new URLSearchParams(location.search).get("n");
    if (q && input) input.value = q;
    window.renderTrack = function (num) {
      var key = (num || "").trim().toUpperCase();
      var d = DEMO[key] || { eta: "1–2 business days", dest: "Destination confirmed after first scan", status: "Order received", scan: "Last scan just now · Booking confirmed",
        steps: [["Order received", "Just now", 2], ["Picked up", "Scheduled", 0], ["In transit", "Pending", 0], ["Out for delivery", "Pending", 0], ["Delivered", "Pending", 0]] };
      document.getElementById("tNum").textContent = key || "—";
      document.getElementById("tEta").textContent = d.eta;
      document.getElementById("tDest").textContent = d.dest;
      document.querySelector("#tPill span:last-child").textContent = d.status;
      document.getElementById("tScan").textContent = d.scan + " · Demo data for prototype.";
      line.innerHTML = "";
      d.steps.forEach(function (s) {
        var li = document.createElement("li");
        li.className = s[2] === 1 ? "done" : s[2] === 2 ? "now done" : "";
        var dot = document.createElement("span"); dot.className = "pt"; dot.setAttribute("aria-hidden", "true");
        var box = document.createElement("div");
        var b = document.createElement("b"); b.textContent = s[0];
        var t = document.createElement("time"); t.textContent = s[1];
        box.appendChild(b); box.appendChild(t); li.appendChild(dot); li.appendChild(box);
        line.appendChild(li);
      });
      res.classList.add("show");
      res.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.dataset.quick === "1") { location.href = "tracking.html?n=" + encodeURIComponent(input.value.trim()); return; }
      window.renderTrack(input.value);
    });
    document.querySelectorAll(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        if (input) input.value = c.dataset.t;
        if (form.dataset.quick === "1") { location.href = "tracking.html?n=" + encodeURIComponent(c.dataset.t); return; }
        window.renderTrack(c.dataset.t);
      });
    });
    if (q) window.renderTrack(q);
  }

  /* dashboard live tick */
  if (!reduced) {
    var a = document.querySelector('[data-live="active"]');
    var c = document.querySelector('[data-live="couriers"]');
    if (a || c) {
      var av = 1284, cv = 312;
      setInterval(function () {
        av += Math.random() > 0.45 ? 1 : -1;
        cv += Math.random() > 0.5 ? 1 : -1;
        if (a) a.textContent = av.toLocaleString();
        if (c) c.textContent = cv;
      }, 4000);
    }
  }

  /* quote form (demo validation) */
  var qf = document.getElementById("quoteForm");
  if (qf) {
    qf.addEventListener("submit", function (e) {
      e.preventDefault();
      var ids = ["fName", "fCo", "fEmail", "fPick", "fDrop"];
      var ok = true, firstBad = null;
      ids.forEach(function (id) {
        var f = document.getElementById(id);
        if (!f) return;
        var bad = !f.value.trim() || (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        f.style.borderColor = bad ? "#C8322B" : "";
        if (bad) { ok = false; firstBad = firstBad || f; }
      });
      if (!ok) { firstBad.focus(); return; }
      document.getElementById("formRef").textContent = "· Ref RQ-" + Math.floor(10000 + Math.random() * 89999);
      document.getElementById("formOk").classList.add("show");
      qf.reset();
      document.getElementById("formOk").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    });
  }

  /* footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
