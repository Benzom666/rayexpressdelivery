/* Editorial coverage map. City labels are geographic references, not depot locations. */
(function () {
  "use strict";

  var host = document.getElementById("coverageMap");
  if (!host || !window.L) return;

  var map = L.map(host, {
    scrollWheelZoom: false,
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true,
    minZoom: 1,
    maxZoom: 7
  });

  L.control.zoom({ position: "bottomright" }).addTo(map);

  function fitCoverage() {
    var north = host.clientWidth < 600 ? 82 : 76;
    map.fitBounds(L.latLngBounds([41.5, -142], [north, -50]), {
      padding: [24, 24], animate: false
    });
  }
  fitCoverage();

  [50, 60, 70].forEach(function (lat) {
    L.polyline([[lat, -145], [lat, -48]], {
      color: "#49717d", weight: 1, opacity: .24, interactive: false
    }).addTo(map);
  });
  [-140, -120, -100, -80, -60].forEach(function (lng) {
    L.polyline([[40, lng], [78, lng]], {
      color: "#49717d", weight: 1, opacity: .24, interactive: false
    }).addTo(map);
  });

  Promise.all([
    fetch("assets/canada-provinces.geojson").then(function (response) {
      if (!response.ok) throw new Error("Province boundaries unavailable");
      return response.json();
    }),
    fetch("assets/canada.geojson").then(function (response) {
      if (!response.ok) throw new Error("Canada outline unavailable");
      return response.json();
    })
  ]).then(function (data) {
    L.geoJSON(data[0], {
      style: { color: "#557582", weight: .8, opacity: .82, fillColor: "#23404c", fillOpacity: 1 },
      interactive: false
    }).addTo(map);
    L.geoJSON(data[1], {
      style: { color: "#9ebdc5", weight: 1.4, opacity: .9, fillOpacity: 0 },
      interactive: false
    }).addTo(map);
  }).catch(function () {
    host.classList.add("rx-map-unavailable");
  });

  var cities = [
    ["Vancouver", 49.2827, -123.1207],
    ["Calgary", 51.0447, -114.0719],
    ["Winnipeg", 49.8951, -97.1384],
    ["Montréal", 45.5019, -73.5674],
    ["Halifax", 44.6488, -63.5752]
  ];
  cities.forEach(function (city) {
    var compact = host.clientWidth < 600;
    var icon = L.divIcon({
      className: "rx-map-city",
      html: '<span class="rx-map-city-dot"></span><span class="rx-map-city-name">' + city[0] + '</span>',
      iconSize: [compact ? 20 : 110, 20],
      iconAnchor: [7, 10]
    });
    L.marker([city[1], city[2]], { icon: icon, title: city[0] })
      .bindPopup("<strong>" + city[0] + "</strong><br>Ask us about a route in this area.")
      .addTo(map);
  });

  var width = host.clientWidth;
  var observer = new ResizeObserver(function () {
    map.invalidateSize();
    if (host.clientWidth !== width) {
      width = host.clientWidth;
      fitCoverage();
    }
  });
  observer.observe(host);
})();
