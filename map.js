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
    showJourney();
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

  function showJourney() {
    var warehouse = [49.2827, -123.1207];
    var pickup = [51.0447, -114.0719];
    var delivery = [45.5019, -73.5674];
    var firstLeg = [warehouse, [50.6745, -120.3273], [51.1784, -115.5708], pickup];
    var secondLeg = [pickup, [50.0405, -110.6765], [50.4452, -104.6189],
      [49.8951, -97.1384], [48.3809, -89.2477], [49.0126, -88.2629],
      [48.7501, -86.4331], [47.9958, -84.7742], [46.5219, -84.3461],
      [46.4917, -80.9930], [46.3091, -79.4608], [45.4215, -75.6972], delivery];
    L.polyline(firstLeg.concat(secondLeg.slice(1)), {
      color: "#ef966d", weight: 2.3, opacity: .9, interactive: false,
      lineCap: "round", lineJoin: "round"
    }).addTo(map);

    var dimensions = host.clientWidth < 600 ? [38, 22] : [46, 27];
    var vehicle = L.marker(warehouse, {
      icon: L.divIcon({
        className: "rx-route-vehicle",
        html: '<img src="assets/map-delivery-van.webp" alt="" width="46" height="27">',
        iconSize: dimensions,
        iconAnchor: [dimensions[0] / 2, dimensions[1] / 2]
      }),
      interactive: false,
      zIndexOffset: 1000
    }).addTo(map);

    var stageItems = document.querySelectorAll("#routeStages li");
    var status = document.getElementById("routeStatus");
    var replay = document.getElementById("routeReplay");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var elapsed = 0;
    var lastTime = 0;
    var frameId = null;
    var visible = false;
    var currentStage = -1;
    var currentStatus = "";
    var duration = 16000;

    function pathData(points) {
      var lengths = [];
      var total = 0;
      for (var i = 0; i < points.length - 1; i++) {
        var length = map.distance(points[i], points[i + 1]);
        lengths.push(length);
        total += length;
      }
      return { points: points, lengths: lengths, total: total };
    }
    var first = pathData(firstLeg);
    var second = pathData(secondLeg);

    function pointOnPath(path, progress) {
      var distance = Math.max(0, Math.min(1, progress)) * path.total;
      for (var i = 0; i < path.lengths.length; i++) {
        if (distance <= path.lengths[i] || i === path.lengths.length - 1) {
          var a = path.points[i], b = path.points[i + 1];
          var fraction = Math.max(0, Math.min(1, distance / path.lengths[i]));
          var screenA = map.latLngToLayerPoint(a), screenB = map.latLngToLayerPoint(b);
          return {
            point: [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction],
            angle: Math.atan2(screenB.y - screenA.y, screenB.x - screenA.x) * 180 / Math.PI
          };
        }
        distance -= path.lengths[i];
      }
    }

    function update(time) {
      var position, stage, label;
      if (time < 1500) {
        position = pointOnPath(first, 0); stage = 0; label = "WAREHOUSE DISPATCH";
      } else if (time < 5500) {
        position = pointOnPath(first, (time - 1500) / 4000); stage = 1; label = "HEADING TO PICKUP";
      } else if (time < 7000) {
        position = pointOnPath(first, 1); stage = 1; label = "PICKUP COMPLETE";
      } else if (time < 14000) {
        position = pointOnPath(second, (time - 7000) / 7000); stage = 2; label = "HEADING TO DELIVERY";
      } else {
        position = pointOnPath(second, 1); stage = 2; label = "DELIVERY COMPLETE";
      }
      vehicle.setLatLng(position.point);
      var image = vehicle.getElement() && vehicle.getElement().querySelector("img");
      if (image) image.style.transform = "rotate(" + position.angle + "deg)";
      if (currentStage !== stage) {
        stageItems.forEach(function (item, index) {
          item.classList.toggle("is-current", index === stage);
          if (index === stage) item.setAttribute("aria-current", "step");
          else item.removeAttribute("aria-current");
        });
        currentStage = stage;
      }
      if (currentStatus !== label && status) {
        status.textContent = label;
        currentStatus = label;
      }
    }

    function shouldRun() {
      return visible && !document.hidden && !reduceMotion.matches && elapsed < duration;
    }
    function frame(now) {
      frameId = null;
      if (!shouldRun()) return;
      if (lastTime) elapsed = Math.min(duration, elapsed + Math.min(now - lastTime, 100));
      lastTime = now;
      update(elapsed);
      if (elapsed < duration) frameId = requestAnimationFrame(frame);
    }
    function sync() {
      if (shouldRun() && frameId === null) {
        lastTime = 0;
        frameId = requestAnimationFrame(frame);
      } else if (!shouldRun() && frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
        lastTime = 0;
      }
      if (reduceMotion.matches) { elapsed = 0; update(0); }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        sync();
      }, { threshold: .1 }).observe(host);
    } else { visible = true; }
    document.addEventListener("visibilitychange", sync);
    reduceMotion.addEventListener("change", sync);
    if (replay) replay.addEventListener("click", function () {
      elapsed = 0;
      lastTime = 0;
      update(0);
      sync();
    });
    update(0);
    sync();
  }

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
