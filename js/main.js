var mymap = L.map('mapid').setView([37.85751, -99.4043], 4);


//add tile layer...replace project id and accessToken with your own
var tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.mapbox-streets-v10',
    accessToken: 'pk.eyJ1Ijoic2VrYW1ham9yIiwiYSI6ImNpeXV3MzNxdDAwNWQycXQ0ZjJxd295N2YifQ.5L9VcCNXmO_yUkqzYzUk_A'
});

tileLayer.addTo(mymap);
var nbaHomeAttendance = getData(mymap);

var popup = L.popup();
//function that dispalys coordinates of site user clicks on
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

function pointToLayer (feature, latlng, attributes){
    //create marker options
            var attribute = attributes[0];
           
            var stadiumSize = "arena_size";
            //variable representing the number of seats in a basketball arena

            //variable representing the attributes of the symbol marking the geoJson features
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 100,
                fillOpacity: 0.8,
            };
    var attributeValue = Number(feature.properties[attribute]/feature.properties[stadiumSize]);
    //attribute representing the attendance percentage for each basketball arena
   
    
    geojsonMarkerOptions.radius = calcPropRadius(attributeValue);
    //radius of the geoJsonMarker
     var layer = L.circleMarker(latlng, geojsonMarkerOptions);
     //places the circle marker at the coodinates provided by the geoJson
     var popupContent = "<p><b>Team:</b> " + feature.properties.City + " " + feature.properties.Team + "</p>";
     //text in popup displaying the team for the specific circle marker
     var year = attribute.split("_")[1];
     //variable representing the year for the displayed data
     popupContent += "<p><b>Home Attendance Percentage in " + year + ":</b> " + Math.ceil(attributeValue*100)+ " %</p>";
     //add on the popup that also displays the Home Attendance Percentage in a specific year
   
     //bind the popup to the location of the circle marker
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


           geojsonLayer = L.geoJson(data, {
                pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
            }
            //returns a marker with the circle shape with characteristics defined by the geojsonMarkerOptions variable
        });
           //geojson layer is added to the map
           geojsonLayer.addTo(map);
           return geojsonLayer;
            
};

function createSequenceControls(map,attributes){
    //sequence bar location is set to the bottom left
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

              //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            // ... initialize other DOM elements, add listeners, etc.
            //add skip buttons
            $(container).append('<button class="skip" id="reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward">Skip</button>');

            $('#reverse').html('<img src="img/reverse.png">');
            $('#forward').html('<img src="img/forward.png">');
            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });

            return container;
        
        }
    
    });  
    //sequence bar is added to the map
    map.addControl(new SequenceControl());

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
    
    
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
       //legend data is returned  with the new index
       var legend = createLegend(map,attributes, index);
       
      //proportional symbols map is updated with the new index and legend
      updatePropSymbols(map, attributes[index],legend);
     
     });

};
function createConferenceControls(data,map,attributes,geojsonLayer,index){
     //Conference selection location is set to the bottom left
     var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            // ... initialize other DOM elements, add listeners, etc.
            //add conference buttons
            $(container).append('<button class="conference" id="westernConference">Western Conference</button>');
            $(container).append('<button class="conference" id="easternConference">Eastern Conference</button>');
            $(container).append('<button class="conference" id="allNBA">NBA</button>');

            $('#westernConference').html('<img src="img/west.png">');
            $('#easternConference').html('<img src="img/east.png">');
            $('#allNBA').html('<img src="img/nbaLogo.png">');
            return container;
        
        }
    
    });  
    //buttons for selecting conference is added to the map
    map.addControl(new SequenceControl());
    //Western Conference proportional symbols are returned
    var west = filterWestPropSymbols(data,map,attributes,geojsonLayer);
    //Eastern Conference proportional symbols are returned
    var east = filterEastPropSymbols(data,map,attributes,geojsonLayer);
    //Western Conference proportional symbols are added to the map
    west.addTo(map);
    //Western Conference proportional symbols are added to the map
    east.addTo(map);
    //Condition for what happens when the Western Conference button is clicked
    $('#westernConference').click(function(){
        west.addTo(map);
        map.removeLayer(east);
        });
       
     //Condition for what happens when the Eastern Conference button is clicked       
    $('#easternConference').click(function(){
         east.addTo(map);
         map.removeLayer(west);
        });      
    //Condition for what happens when the NBA button is clicked
    $('#allNBA').click(function(){
         east.addTo(map);
         west.addTo(map);
        });  
      //return updatedConference;
      updatePropSymbols(map, attributes,index);
    

};
function createLegend(map, attributes, index){
     //this attribute represents the year that the data belongs to
    var attribute = attributes[index];
      
    var container;
    //this variable will hold the year that the data belongs to
    var year;
    //this variable represents the Legend object being created
    var LegendControl 
        LegendControl = L.Control.extend({
        options: {
            //places the location of the legend in the bottom right corner
            position: 'bottomright'
        },
        //function for when a legend is added ot he map
        onAdd: function (map) {
            // create the control container with a particular class name
            
            container = L.DomUtil.create('div', 'legend-control-container');
            year = attribute.split("_")[1];
                
            container.innerHTML += "<b>Home Attendance Percentage in " + year + "</b>";
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            console.log(container);
            //console.log(year);
            return container;
        },
        //function for when a legend is removed from the map
        onRemove: function (map) {
        // when removed
        $(container).replaceWith("<b>Home Attendance Percentage in " + year + "</b>");
        console.log(container);
        return container
        }

    });
   var mapLegend = new LegendControl();
   //map.addControl(mapLegend);
   return mapLegend
   

   
   
  

   
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
        }
        
    };

    //check result
    return attributes;
    
};

function updatePropSymbols(map, attribute, mapLegend){
    map.eachLayer(function(layer){
         if (layer.feature && layer.feature.properties[attribute]){
            //update the layer style and popup
            map.removeControl(mapLegend);
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
            map.addControl(mapLegend);
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
             //index used to represent the earliest year in the sequence
            var index = 0;
            //create an attributes array
            var attributes = processData(response);
            
            //create proportional symbols using the acquired goeJson data
            var allNba = createPropSymbols(response,map,attributes);
            //create sequence controls
            createSequenceControls(map,attributes);
            //create the conference controls
            createConferenceControls(response,map,attributes,allNba,index);
            //initial map legend is created and added to the map
            var mapLegend = createLegend(map,attributes,index);
            map.addControl(mapLegend);



            
        }
    });
};

function filterEastPropSymbols (data,map,attributes, geojsonLayer){
            
           var eastTeams = L.geoJson(data, {
                //function searches for features in the geoJson layer whose Conference property is Eastern
                filter: function (feature,layer){
                    return feature.properties.Conference == "Eastern";
                }, 
                pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
            }
                    
                   
            //returns a marker with the circle shape with characteristics defined by the geojsonMarkerOptions variable
        });
           //the input geojson layer is removed from the map
           map.removeLayer(geojsonLayer);
           //eastern conference data is returned
           return eastTeams;
           
          
            
};
function filterWestPropSymbols (data,map,attributes, geojsonLayer){

            
           var westTeams = L.geoJson(data, {
                //function searches for features in the geoJson layer whose Conference property is Western
                filter: function (feature,layer){
                    return feature.properties.Conference == "Western";
                }, 
                pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
            }
                    
                   
             //returns a marker with the circle shape with characteristics defined by the geojsonMarkerOptions variable
        });
           //the input geojson layer is removed from the map
           map.removeLayer(geojsonLayer);
           //western conference data is returned
           return westTeams;
               
            
};

  
mymap.on('click', onMapClick);