// Creating our initial map object
// We set the longitude, latitude, and the starting zoom level
// This gets inserted into the div with an id of 'map'
var myMap = L.map("map", {
    center: [31.44, -100.45], // latitude, longitude
    zoom: 4
});

// Adding tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: MAPBOX_API_KEY
}).addTo(myMap);

// Customize and add a legend
function addLegend() {
    let legend = L.control({ position: 'topright' });

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
}

// Utility function
function magnitudeToColor(magnitude) {
    return `hsla(${30 - 9 * magnitude}, 100%, 60%, 0.8)`;
}

// Read the earthquake data and decorate the map
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(quakes => {
    L.geoJSON(quakes.features, {
        pointToLayer: function (feature, latlng) {
            let magnitude = feature.properties.mag;
            return L.circleMarker(latlng,
                {
                    radius: 3.0 + 2 * magnitude,
                    color: `${magnitudeToColor(magnitude)}`,
                    fillOpacity: 0.8
                }
            );
        }
    }).bindPopup(function (layer) {
        return "Magnitude:  " + layer.feature.properties.mag.toString() + "<br/>Location:  " + layer.feature.properties.place;
    }).addTo(myMap);

    addLegend();
});
