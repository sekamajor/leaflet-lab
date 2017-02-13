/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var mymap = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mymap);

    //call getData function
    getData(mymap);
};
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            //adds the phrase to the popupContent variable
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};
//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/map.geojson", {
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
            //
            }).addTo(map);
        }
    });
};
//the actual map is created
$(document).ready(createMap);