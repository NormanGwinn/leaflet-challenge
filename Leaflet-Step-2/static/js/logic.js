// Define three interchangeable tile layers for the world map
var satelliteLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MAPBOX_API_KEY
});

var grayscaleLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MAPBOX_API_KEY
});

var outdoorsLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MAPBOX_API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
    "Satellite Map": satelliteLayer,
    "Grayscale Map": grayscaleLayer,
    "Outdoors Map": outdoorsLayer
};

// Load techtonic plate boundaries
var boundaries;
d3.json("static/json/PB2002_boundaries.json").then(data => {
    boundaries = L.geoJSON(data.features);
});

// Utility function, for consistent a magnitude-to-color relationship
function magnitudeToColor(magnitude) {
    return `hsla(${30 - 9 * magnitude}, 100%, 60%, 0.8)`;
}

// Load earthquake events, load map, and load controls (layer control and legend)
var earthquakes;
var overLays;
var myMap;
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
d3.json(quakeURL).then(quakes => {
    earthquakes = L.geoJSON(quakes.features, {
        pointToLayer: ((feature, latlng) => (
            L.circleMarker(latlng,
                {
                    radius: 3.0 + 2 * feature.properties.mag,
                    color: `${magnitudeToColor(feature.properties.mag)}`,
                    fillOpacity: 0.8
                }
            )
        ))
    }).bindPopup(layer => ("Magnitude:  " + layer.feature.properties.mag.toString()
        + "<br/>Location:  " + layer.feature.properties.place));

    overLays = {
        "Earthquakes": earthquakes,
        "Techtonic Plates": boundaries
    }

    // Create the initial map, with two layers
    myMap = L.map("map", {
        center: [31.44, -100.45], // latitude, longitude
        zoom: 4,
        layers: [outdoorsLayer, earthquakes]
    });

    // Create a layer control, for the baseMaps and overLays
    L.control.layers(baseMaps, overLays, {
        collapsed: false
    }).addTo(myMap);

    // Craft and add a legend
    let legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let magnitudes = [1, 3, 5, 7, 9];
        magnitudes.forEach(m => {
            div.innerHTML +=
                '<i style="background:' + `${magnitudeToColor(m)}` + '"></i> ' +
                (m - 1) + '&ndash;' + (m + 1) + '<br>';
        });
        return div;
    };

    legend.addTo(myMap);
});