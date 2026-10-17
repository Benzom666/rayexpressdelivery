/* Ray Express coverage illustration. This is not live vehicle tracking. */
(function () {
  "use strict";
  var host = document.getElementById("coverageMap");
  if (!host || !window.L) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var map = L.map(host, { scrollWheelZoom: false, zoomControl: false, attributionControl: true });
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(map);

  var cities = [
    ["Vancouver", 49.2827, -123.1207], ["Calgary", 51.0447, -114.0719],
    ["Edmonton", 53.5461, -113.4938], ["Winnipeg", 49.8951, -97.1384],
    ["Toronto", 43.6532, -79.3832], ["Ottawa", 45.4215, -75.6972],
    ["Montréal", 45.5019, -73.5674], ["Halifax", 44.6488, -63.5752]
  ];
  var cityIcon = L.divIcon({ className: "", html: '<span class="rx-city-pin" aria-hidden="true"></span>', iconSize: [15, 15], iconAnchor: [7, 7] });
  cities.forEach(function (city) {
    L.marker([city[1], city[2]], { icon: cityIcon }).bindPopup("<strong>" + city[0] + "</strong><br>Ask us about delivery in this area.").addTo(map);
  });
  L.circle([43.77, -79.43], { radius: 60000, color: "#ed7843", weight: 2, fillColor: "#ed7843", fillOpacity: .12, dashArray: "6 6" })
    .bindPopup("Greater Toronto Area focus").addTo(map);

  var gtaRoute = [
    [43.5890, -79.6441], [43.6188, -79.5791], [43.6426, -79.4674],
    [43.6532, -79.3832], [43.6701, -79.3080], [43.7731, -79.2578]
  ];
  var routes = [
    { points: [[49.2827,-123.1207],[49.88,-119.50],[51.0447,-114.0719],[50.45,-104.61],[49.8951,-97.1384]], duration: 18000, offset: 0, color: "#f88348" },
    { points: [[49.8951,-97.1384],[48.38,-89.25],[46.52,-84.35],[43.6532,-79.3832]], duration: 15000, offset: .37, color: "#84e1f2" },
    { points: [[43.6532,-79.3832],[45.4215,-75.6972],[45.5019,-73.5674],[46.81,-71.21],[45.96,-66.64],[44.6488,-63.5752]], duration: 17000, offset: .68, color: "#f88348" },
    { points: gtaRoute, duration: 13000, offset: .18, color: "#f88348", local: true }
  ];
  var carIcon = L.divIcon({ className: "", html: '<span class="rx-car-pin" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16V8h11v8M14 11h4l3 3v2H3"/><circle cx="7" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg></span>', iconSize: [32, 32], iconAnchor: [16, 16] });
  routes.forEach(function (route) {
    L.polyline(route.points, { color: route.color, weight: route.local ? 4 : 3, opacity: .9, dashArray: route.local ? "10 7" : "8 9" }).addTo(map);
    route.marker = L.marker(route.points[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
  });
  var controls = document.querySelectorAll("[data-map-view]");
  function setView(view) {
    controls.forEach(function (button) { button.setAttribute("aria-pressed", String(button.dataset.mapView === view)); });
    if (view === "gta") map.fitBounds([[43.50, -79.82], [43.89, -79.12]], { padding: [20, 20], animate: !reduceMotion.matches });
    else map.setView([55, -99], host.clientWidth < 650 ? 3 : 4, { animate: !reduceMotion.matches });
  }
  controls.forEach(function (button) { button.addEventListener("click", function () { setView(button.dataset.mapView); }); });
  setView("canada");

  var visible = false, start = 0;
  function placeCar(route, progress) {
    var length = route.points.length - 1, segment = Math.min(Math.floor(progress * length), length - 1);
    var part = progress * length - segment, a = route.points[segment], b = route.points[segment + 1];
    route.marker.setLatLng([a[0] + (b[0] - a[0]) * part, a[1] + (b[1] - a[1]) * part]);
  }
  function frame(time) {
    if (!visible || reduceMotion.matches) return;
    if (!start) start = time;
    routes.forEach(function (route) {
      var cycle = (((time - start) / route.duration) + route.offset) % 2;
      placeCar(route, cycle <= 1 ? cycle : 2 - cycle);
    });
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var wasVisible = visible;
      visible = entries[0].isIntersecting;
      if (visible && !wasVisible && !reduceMotion.matches) { start = 0; requestAnimationFrame(frame); }
    }, { threshold: .15 }).observe(host);
  } else if (!reduceMotion.matches) { visible = true; requestAnimationFrame(frame); }
  reduceMotion.addEventListener("change", function () { if (!reduceMotion.matches && visible) { start = 0; requestAnimationFrame(frame); } });
})();
