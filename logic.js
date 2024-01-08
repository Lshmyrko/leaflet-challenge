// Create the tile layer that will be the background of our map.
let USAmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create a baseMaps object to hold the streetmap layer.
let baseMaps = {
    "USA Map": USAmap
};

// Set the center of the map to the center of the USA 
let centerUSA = [39.8283, -98.5795];

// Create the map object with options.
let map = L.map("map", {
    center: centerUSA,  
    zoom: 4,            
    layers: [USAmap]
});

// Function to create markers from GeoJSON data
function createMarkers(geoJSONData) {
    let earthquakeMarkers = L.geoJSON(geoJSONData, {
        pointToLayer: function (feature, latlng) {
            // Adjust marker size based on earthquake magnitude
            let markerSize = feature.properties.mag * 5;

            // Adjust marker color based on earthquake depth
            let markerColor = getColor(feature.geometry.coordinates[2]);

            // Create a circle marker with size and color based on magnitude and depth
            return L.circleMarker(latlng, {
                radius: markerSize,
                fillColor: markerColor,
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(
                `<h3>${feature.properties.place}</h3>
                <p>Magnitude: ${feature.properties.mag}</p>
                <p>Depth: ${feature.geometry.coordinates[2]}</p>`
            );
        }
    });

    // Add the GeoJSON layer with markers to the map
    earthquakeMarkers.addTo(map);

    // Add legend to the map
    addLegend();
}

// Function to get color based on earthquake depth
function getColor(depth) {
    if (depth < 10) return "#1a9850"; // green
    else if (depth < 30) return "#91cf60"; // light green
    else if (depth < 50) return "#fee08b"; // yellow
    else if (depth < 70) return "#fc8d59"; // orange
    else return "#d73027"; // red
}

// Function to add legend to the map
function addLegend() {
    let legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create("div", "info legend");
        let depthLevels = [0, 10, 30, 50, 70];
        let labels = [];

        for (let i = 0; i < depthLevels.length; i++) {
            div.innerHTML +=
                '<i style="background:' +
                getColor(depthLevels[i] + 1) +
                '"></i> ' +
                depthLevels[i] +
                (depthLevels[i + 1] ? "&ndash;" + depthLevels[i + 1] + "<br>" : "+");
        }

        return div;
    };

    legend.addTo(map);
}

// Use 'features' instead of 'data.features' in the URL
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);
