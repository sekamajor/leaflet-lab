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

function pointToLayer (feature, latlng, attributes){
    //create marker options
            var attribute = attributes[0];

            console.log(attribute);
            
            var stadiumSize = "arena_size";
            
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 100,
                fillOpacity: 0.8,
            };
    var attributeValue = Number(feature.properties[attribute]/feature.properties[stadiumSize]);
    
    geojsonMarkerOptions.radius = calcPropRadius(attributeValue);

     var layer = L.circleMarker(latlng, geojsonMarkerOptions);

     var popupContent = "<p><b>City:</b> " + feature.properties.City + " " + feature.properties.Team + "</p>";

     var year = attribute.split("_")[1];

     popupContent += "<p><b>Home Attendance Percentage in " + year + ":</b> " + Math.ceil(attributeValue*100)+ " %</p>";

     

     layer.bindPopup(popupContent, {
        offset: new L.Point(0,-geojsonMarkerOptions.radius),
        closeButton: false 
    });

     //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
        }
    });

     return layer;
 };

    
    function calcPropRadius(attValue){
    //scale factor to adjust symbol size evenly
    var scaleFactor = 100;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;

};

//create a Leaflet GeoJSON layer and add it to the map
function createPropSymbols (data,map,attributes){


            L.geoJson(data, {
                pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
            }
                    
                   
                     //returns a marker with the circle shape with characteristics defined by the geojsonMarkerOptions variable
        }).addTo(map);
};
function createSequenceControls(map,attributes){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    //add skip buttons
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');

     $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
//click listener for buttons
    $('.skip').click(function(){
       
       //get the old index value
        var index = $('.range-slider').val();

         //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
             //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };
         //Step 8: update slider
        $('.range-slider').val(index);
      updatePropSymbols(map, attributes[index]);
     });

};
function processData(data){
    //empty array to hold attributes
    var attributes = [];
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
         if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            //access feature properties
            var props = layer.feature.properties;
            var stadiumSize = "arena_size";

            var attributeValue = Number(layer.feature.properties[attribute]/layer.feature.properties[stadiumSize]);

             //update each feature's radius based on new attribute values
            var radius = calcPropRadius(attributeValue);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + " " + props.Team + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Home Attendance Percentage in " + year + ":</b> " + Math.ceil(attributeValue*100)+ " %</p>";


            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });

        };
    });

};


function getData(map){
    //load the data
    $.ajax("data/NbaAttendance.geojson", {
        dataType: "json",
        success: function(response){
             //create an attributes array
            var attributes = processData(response);
            
            createPropSymbols(response,map,attributes);
            createSequenceControls(map,attributes);


            
        }
    });
};

mymap.on('click', onMapClick);