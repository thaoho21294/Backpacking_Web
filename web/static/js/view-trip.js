  
// A JSON Array containing some people/routes and the destinations/stops

// var tripArray = {
//     "route1": [nice_hotel, thac_dalanta],
//     "route2": [nice_hotel, cho_da_lat],
//     //   "route3": [tam_chau, cay_xang_comeco],
//     //  "route4": [madagui, cay_xang_comeco],
//     //"route5": [nice_hotel, madagui]
//     "route6": [nice_hotel, dinh_pinhatt, thac_dalanta]
//         //   "route7": [nice_hotel, dinh_pinhatt, thac_dalanta]
//         //  "route8": [nice_hotel, dinh_pinhatt, thac_dalanta]
// };
var routeArray = {}
var stops=[]
var stops_title=[]
$(document).ready(function() {
    $.get("/api/stops?tripid=195", function(data) {
      if (!data) alert("no data!")
      stops = data.stops
      send_route_map()
      create_stops_distinct()
      send_data_plan()
        function send_route_map() {
            //create routes include many stop
            var mode = stops[1].mode
            var start = 1,
                index = 1;
            while (start < stops.length - 1) {
                var route = []
                for (var i = start; i < stops.length; i++) {
                    //add stop to route
                    if (stops[i].mode != mode) {
                        start = i
                        //console.log(start)
                        mode = stops[i].mode
                        //next route
                        break
                    }
                    route.push({
                        "lat": stops[i].lat,
                        "lng": stops[i].lng
                    });
                    //increase start route
                    start = i + 1

                }
                routeArray["route" + index] = route
                index++
            }
            routeArray["route1"].unshift({
                "lat": stops[0].lat,
                "lng": stops[0].lng
            })
            initMap(routeArray);
        }
        function create_stops_distinct(){
            var i=1;
            var dup
            stops_title.push(stops[0].name);   
            while(i<stops.length){
                dup=false;
                //console.log(stops[i].name)
                for(var j=0; j<stops_title.length;j++){
                    if(stops_title[j]==stops[i].name){
                     dup=true
                     break 
                    }
                }
                if(!dup){
                stops_title.push(stops[i].name);
                }
                i++
            }
        }
        function send_data_plan(){
         $("#plan-list").append("<li class='list-item' id='stop_0'><div class='content1'><img id='avar' src='/images/flag2.png'>"+stops[0].name+"</div></li>");
          for(var i=1; i<stops.length; i++){
          // var departure= new Date(stops[i].departure)
          // var arrrive = new Date(stops[i].arrive)

          //date for route
          // var start=new Date(stops[i].departure)
          // var end = new Date(stops[i].arrive)
          // start= formatDatetoTime(start)
          // end= formatDatetoTime(end)
          //date for stop
          var arrive=new Date(stops[i].arrive)
          var departure=new Date(stops[i].departure)
          var duration=calulateStopDuration(stops[i].arrive, stops[i].departure)


          $("#plan-list").append("\
            <li class='list-item' id='route_"+i+"'>\
            <div class='content1'>\
            <ul class= 'route-list'>\
          <li class='route-item'>\
            "+stops[i].mode+"\
          </li>\
          <li class='route-item'>\
              "+formatDatetoTime(departure)+"\
          </li>\
          <li class='route-item'>\
              "+formatDuration(stops[i].route_duration)+"/"+formatDistance(stops[i].route_distance)+"\
          </li>\
          <li class='route-item'>\
              "+formatDatetoTime(arrive)+"\
          </li>\
            </ul>\
            </div></li>\
            <li class='list-item' id='stop_"+i+"'>\
            <div class='content1'><img id='avar' src='/images/flag2.png'>"+stops[i].name+"</div>\
            </li>");
             }
            }

    }, "json");

    $.get("/api/tripdetail?tripid=195", function(data) {
        if (!data.tripdetail) alert("no data!")
        $(".panel-body").append(data.tripdetail.description)

    }, "json");

});
function formatDatetoDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  //var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear();
  //return strTime
}
function formatDatetoTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  //return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
  return strTime
}
function formatDuration(duration){
  if (duration<60)
    return duration+"p"
  else {
    return ~~(duration/60)+"h"+duration%60
  }
}
function formatDistance(distance){
  if (distance<1000)
    return distance+"m"
  else {
    return (distance/1000)+"km"
  }
}
function calulateStopDuration(startdate_ms, enddate_ms){
    // var duration = enddate_ms-startdate_ms;
    // duration = duration/1000 //to second
   // var second= Math.floor(duration%60)
    // duration= duration/60
    // var minutes = Math.floor(duration%60)
    // duration= duration/60
    // var hours= Math.floor(duration%60)
    // var days = Math.floor(duration/24);
    // if(days==0) {days=""} else{ days=days+'d'}
    // if(hours==0) {hours="" }else {hours= hours+'h'}
    // if(minutes==0) minutes="";
    //return days+hours+minutes
    return "SSS";
}
//event for plan-list
$("#plan-list").on('mouseenter', '.content1', function(){
  $(this).css('background-color','white')
});
$("#plan-list").on('mouseleave', '.content1', function(){
//  alert("leave");
  $(this).css('background-color','#d3d3d3')
});

$("#plan-list").on('click', '.content1', function(){
  $(this).hide();
  //$(this).children(".content2").show();
  var stop_id= $(this).parents(".list-item").attr('id')
  var type=stop_id.split('_')[0];
  var id= stop_id.split('_')[1];
            var arrive=new Date(stops[id].arrive)
          var departure=new Date(stops[id].departure)
          var duration= "1h"//calulateStopDuration(stops[id].arrive, stops[id].departure)
    console.log(stops[id].name)
    var string=""
    var stop_string ="<div class='content2'>\
        <ul class='content2-header'>\
          <li class='content2-header-item'><img id='avar' src='/images/flag2.png'> </li>\
          <li class='content2-header-item'><button class='up'>Up <span class='glyphicon glyphicon-arrow-up'></span></button></button></li>\
          <li class='content2-header-item'><button class='down'>Down <span class='glyphicon glyphicon-arrow-down'></span></button></li>\
          <li class='li-close-button'><button class='close-button'>x</button></li>\
        </ul>\
        <div class ='content2-body'>\
            <form class='stop-detail'>\
              <div class='item-content2'><input type='text' name='stop-name' value='"+stops[id].name+"'></div>\
              <div class='item-content2'><input type='text' name='stop-address' value='"+stops[id].address+"'></div>\
              <div class='item-content2'>\
               <label class='stop-label'>Thời gian đến</label><input type='text' name='stop-arrive-date' value='"+formatDatetoDate(arrive)+"'>\
               <input type='text' name='stop-arrive-time' value='"+formatDatetoTime(arrive)+"'>\
              </div>\
              <div class='item-content2'><label class='stop-label'>Thời gian trải qua:</label><input type='text' name='stop-duration-time' value="+duration+"></div>\
              <div class='item-content2'>\
              <label class='stop-label'>Thời gian đi</label><input type='text' name='stop-departure-date' value='"+formatDatetoDate(departure)+"'>\
              <input type='text' name='stop-departure-time' value='"+formatDatetoTime(departure)+"'>\
              </div>\
              <div class='item-content2'><textarea class='stop-description' placeholder='Mô tả điểm dừng'>"+stops[id].description+"</textarea></div>\
               </form>\
        </div>\
      </div>";
      var route_string="<div class='content2'>\
        <ul class='content2-header'>\
          <li class='content2-header-item'><button><img class='mode-icon' src='/images/moto-icon.png'></button></li>\
          <li class='li-close-button'><button class='close-button'>x</button></li>\
        </ul>\
        <div class ='content2-body'>\
            <form class='stop-detail'>\
          <div class='item-content2'><input type='text' name='route-name' value='"+stops[id].route_name+"'></div>\
          <div class='item-content2'>\
              <label class='route-label'>Xuất phát: </label><input type='text' name='route-start-time' value='"+formatDatetoTime(departure)+"'>\
          </div>\
              <div class='item-content2'>\
               <b>Khoảng cách:</b> <input type='text' name='route-distance' value='"+formatDistance(stops[id].route_distance)+"'>\
               <b>Thời gian:</b> <input type='text' name='route-duration-time' value='"+formatDuration(stops[id].route_duration)+"'>\
              </div>\
              <div class='item-content2'>\
              <label class='route-label'>Kết thúc</label><input type='text' name='route-departure-time' value='"+formatDatetoTime(arrive)+"'>\
              </div>\
        </form>\
        </div>\
        </div>";

        if(type=="stop") string=stop_string
            else{
                string=route_string;
            }
      $(this).parents('.list-item').append(string);
});

$("#plan-list").on('click', '.close-button', function(e){
     e.stopPropagation()
     $(this).parents(".content2").hide();

     $(this).parents(".list-item").children(".content1").show();

 });


var directionsService
var map
var colourArray = ['navy', 'grey', 'fuchsia', 'black', 'white', 'lime', 'maroon', 'purple', 'aqua', 'red', 'green', 'silver', 'olive', 'blue', 'yellow', 'teal'];

//we have a array route to draw
// Let's make an array of requests which will become individual polylines on the map.
function generateRequests(jsonArray) {
    var requestArray = [];
    var data;
    for (var route in jsonArray) {
        var waypts = [];
        // 'start' and 'finish' will be the routes origin and destination
        var start, finish
            // lastpoint is used to ensure that duplicate waypoints are stripped
        var lastpoint
        data = jsonArray[route]
            //console.log(data);
        var limit = data.length
        for (var waypoint = 0; waypoint < limit; waypoint++) {
            if (data[waypoint] === lastpoint) {
                // Duplicate of the last waypoint - don't bother
                continue;
            }
            // Prepare the lastpoint for the next loop
            lastpoint = data[waypoint]
                // Add this to waypoint to the array for making the request
            waypts.push({
                location: data[waypoint],
                stopover: true
            });
        }
        start = (waypts.shift()).location;
        finish = waypts.pop();
        if (finish === undefined) {
            // Unless there was no finish location for some reason?
            finish = start;
        } else {
            finish = finish.location;
        }
        var request = {
            origin: start,
            destination: finish,
            waypoints: waypts,
            travelMode: google.maps.TravelMode.DRIVING
        };
        requestArray.push({
            "route": route,
            "request": request
        });


    }
     processRequests(requestArray);
}
 // Start/Finish icons
 var icons = {
  start: new google.maps.MarkerImage(
   // URL
   'images/flag2.png',
   // (width,height)
   new google.maps.Size( 44, 32 )
  ),
  end: new google.maps.MarkerImage(
   // URL
   'images/flag2.png',
   // (width,height)
   new google.maps.Size( 44, 32 ),
   // The origin point (x,y)
   new google.maps.Point( 0, 0 ),
   // The anchor point (x,y)
   new google.maps.Point( 22, 32 )
  )
 };

var route_stops=[];
function processRequests(requestArrayParam) {

    var i = 0;
    var j=0;
    var renderArray = [];
    function submitRequest() {
      ///love forever
        directionsService.route(requestArrayParam[i].request, directionResults);
      }

    function directionResults(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            // Create a unique DirectionsRenderer 'i'
            renderArray[i] = new google.maps.DirectionsRenderer();
            renderArray[i].setMap(map);

            // Some unique options from the colorArray so we can see the routes
            renderArray[i].setOptions({
                suppressMarkers: true,
                preserveViewport: true,
                suppressInfoWindows: true,
                polylineOptions: {
                    strokeWeight: 4,
                    strokeOpacity: 0.2,
                    strokeColor: 'blue'
                },
                markerOptions: {
                    icon: "images/flag2.png"
                    }
            });
            // Use this new renderer with the result
            renderArray[i].setDirections(result);
            var legs= result.routes[0].legs;
  
            // get location of all stop
            for(var l=0;l<legs.length; l++){

                route_stops.push(legs[l].start_location)
            }          
            nextRequest();
        }
    }

    function nextRequest() {
        // Increase the counter
        i++;

        // Make sure we are still waiting for a request
        if (i >= requestArrayParam.length) {
            // No more to do
            // create makrer on map by location and title
            for(var j=0; j<route_stops.length; j++){

                makeMarker(route_stops[j], icons.start, stops_title[j]);
             
            }
            // and start the next request
            return;
        }
        // Submit another request
        submitRequest();
    }
    // This request is just to kick start the whole process
    submitRequest();

}
function makeMarker( position, icon, title ) {
 new google.maps.Marker({
  position: position,
  map: map,
  icon: icon,
  title: title
 });
}
var nice_hotel = {
    lat: 11.9422612,
    lng: 108.4345293
}
function initMap(jsonArray) {
    var mapOption = {
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        center: nice_hotel,
        mapTypeId: 'roadmap'
    };
    directionsService = new google.maps.DirectionsService;
    map = new google.maps.Map(document.getElementById('map'), mapOption);
    generateRequests(jsonArray);

}
