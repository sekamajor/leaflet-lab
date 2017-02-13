var mymap = L.map('mapid').setView([20, -0], 2);

//add tile layer...replace project id and accessToken with your own
var tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.mapbox-streets-v10',
    accessToken: 'pk.eyJ1Ijoic2VrYW1ham9yIiwiYSI6ImNpeXV3MzNxdDAwNWQycXQ0ZjJxd295N2YifQ.5L9VcCNXmO_yUkqzYzUk_A'
});

tileLayer.addTo(mymap);
getData(mymap);


/*var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);*/


var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};
function getData(map){
    //load the data
    $.ajax("data/NbaAttendance.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    //returns a marker with the circle shape with characteristics defined by the geojsonMarkerOptions variable
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                 onEachFeature: onEachFeature,
                 filter: function(feature, layer) {
                    return feature.properties.Pop_2015 > 20;
                }

            }).addTo(map);
        }
    });
};

mymap.on('click', onMapClick);