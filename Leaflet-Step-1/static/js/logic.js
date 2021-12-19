// URLs
var quake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// d3 retrieve data
d3.json(quake_url, function(data) {
    createFeatures(data.features);
});

// // create functions for each circle property

// circle colour
function circleColour(mag) {
    if (mag <= 1) {
        return "#B7F34D";
    }
    else if (mag <= 2) {
        return "#E1F34D";
    }
    else if (mag <= 3) {
        return "#F3DB4D";
    }
    else if (mag <= 4) {
        return "#F3BA4D";
    }
    else if (mag <= 5) {
        return "#F0A76B";
    }
    else {
        return "#F06B6B";
    };
}

// circle size
function circleSize(mag) {
    return mag * 25000;
}

function createFeatures(quakeData) {   
    var quakes = L.geoJSON(quakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place + 
                "</h3><hr><p>" + "Time: " + new Date(feature.properties.time) + 
                "</p><p>Magnitude: " + feature.properties.mag + "</p>")
            }, pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                radius: circleSize(feature.properties.mag),
                fillColor: circleColour(feature.properties.mag),
                fillOpacity: 0.8,
                stroke: false,
            })
        }
    });
    createMap(quakes);
}

// map creation function
function createMap(quakes) {
    // tile layer
    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    // base layer map
    var baseMaps = {
        "Light Map": lightMap,
        "Dark Map": darkMap,
        "Satellite Map": satelliteMap
    };

    // add plates here
    var plates = new L.LayerGroup();
    d3.json(plates_url, function(data) {
        L.geoJSON(data, {style: {
            color: "#ED9901",
            fillColor: "none",
            weight: 1
        }}).addTo(plates);
    });

    // overlay for quake circles and plates
    var overlayMaps = {
        "Earthquakes": quakes,
        "Tectonic Plates": plates
    };

    var myMap = L.map("map", {
        center: [20, 0],
        zoom: 3,
        layers: [lightMap, quakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);




// legend
var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleColour(magnitudes[i] + 1) + '"></i> ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}