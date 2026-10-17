/* RAY EXPRESS — shared interactions */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heroVideo = document.querySelector(".rx-hero-video");
  if (heroVideo) {
    var heroMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var heroVisible = true;
    function syncHeroMotion() {
      if (heroMotion.matches || !heroVisible) heroVideo.pause();
      else { var play = heroVideo.play(); if (play && play.catch) play.catch(function () {}); }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        syncHeroMotion();
      }, { threshold: .05 }).observe(heroVideo);
    }
    heroMotion.addEventListener("change", syncHeroMotion);
    syncHeroMotion();
  }

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
      var d = DEMO[key];
      var notice = document.getElementById("trackNotice");
      if (!d) {
        res.classList.remove("show");
        if (notice) notice.textContent = "That number isn't part of this preview. For a real shipment update, contact our team.";
        return;
      }
      if (notice) notice.textContent = "Illustrated sample only. For a real shipment update, contact our team.";
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

  /* quote form: compose a real email without implying it was submitted */
  var qf = document.getElementById("quoteForm");
  if (qf) {
    qf.addEventListener("submit", function (e) {
      e.preventDefault();
      var ids = ["fName", "fEmail", "fPick", "fDrop"];
      var ok = true, firstBad = null;
      ids.forEach(function (id) {
        var f = document.getElementById(id);
        if (!f) return;
        var bad = !f.value.trim() || (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        f.style.borderColor = bad ? "#C8322B" : "";
        if (bad) { ok = false; firstBad = firstBad || f; }
      });
      if (!ok) { firstBad.focus(); return; }
      var data = new FormData(qf);
      var fields = [["Name", "name"], ["Company", "company"], ["Email", "email"], ["Phone", "phone"],
        ["Pickup", "pickup"], ["Delivery area", "delivery"], ["Shipments per week", "volume"],
        ["Frequency", "frequency"], ["Service", "service"], ["Message", "message"]];
      var body = fields.map(function (pair) { return pair[0] + ": " + (data.get(pair[1]) || "—"); }).join("\n");
      var subject = "Ray Express quote request — " + (data.get("company") || data.get("name"));
      window.location.href = "mailto:info@rayexpressdelivery.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      document.getElementById("formOk").classList.add("show");
      document.getElementById("formOk").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    });
  }

  /* footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
