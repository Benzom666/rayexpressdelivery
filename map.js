/* Ray Express coverage illustration. This is not live vehicle tracking. */
(function () {
  "use strict";
  var host = document.getElementById("coverageMap");
  if (!host || !window.L) return;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var map = L.map(host, { scrollWheelZoom: false, zoomControl: false, attributionControl: true });
  L.control.zoom({ position: "bottomright" }).addTo(map);
  map.attributionControl.addAttribution('Map data: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>');
  fetch("assets/canada.geojson").then(function (response) {
    if (!response.ok) throw new Error("Map outline unavailable");
    return response.json();
  }).then(function (shape) {
    L.geoJSON(shape, { style: { color: "#88adbd", weight: 1.5, fillColor: "#24475a", fillOpacity: 1 } }).addTo(map).bringToBack();
  }).catch(function () { /* Routes and markers remain usable without the outline. */ });

  var cities = [
    ["Vancouver", 49.2827, -123.1207], ["Calgary", 51.0447, -114.0719],
    ["Edmonton", 53.5461, -113.4938], ["Winnipeg", 49.8951, -97.1384],
    ["Ottawa", 45.4215, -75.6972],
    ["Montréal", 45.5019, -73.5674], ["Halifax", 44.6488, -63.5752]
  ];
  var cityIcon = L.divIcon({ className: "", html: '<span class="rx-city-pin" aria-hidden="true"></span>', iconSize: [15, 15], iconAnchor: [7, 7] });
  cities.forEach(function (city) {
    L.marker([city[1], city[2]], { icon: cityIcon }).bindPopup("<strong>" + city[0] + "</strong><br>Ask us about delivery in this area.").addTo(map);
  });
  var routes = [
    { points: [[49.2827,-123.1207],[49.88,-119.50],[51.0447,-114.0719],[50.45,-104.61],[49.8951,-97.1384]], duration: 18000, offset: 0, color: "#f88348" },
    { points: [[49.8951,-97.1384],[48.38,-89.25],[46.52,-84.35],[45.4215,-75.6972]], duration: 15000, offset: .37, color: "#84e1f2" },
    { points: [[45.4215,-75.6972],[45.5019,-73.5674],[46.81,-71.21],[45.96,-66.64],[44.6488,-63.5752]], duration: 17000, offset: .68, color: "#f88348" }
  ];
  var carIcon = L.divIcon({ className: "", html: '<span class="rx-car-pin" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16V8h11v8M14 11h4l3 3v2H3"/><circle cx="7" cy="17" r="2"/><circle cx="18" cy="17" r="2"/></svg></span>', iconSize: [32, 32], iconAnchor: [16, 16] });
  routes.forEach(function (route) {
    L.polyline(route.points, { color: route.color, weight: 3, opacity: .9, dashArray: "8 9" }).addTo(map);
    route.marker = L.marker(route.points[0], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
  });
  map.setView([55, -99], host.clientWidth < 650 ? 3 : 4, { animate: false });

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
