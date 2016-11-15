  
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
var icons;
var tripdetail
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}
var tripid=$.urlParam('tripid');
$(document).ready(function() {

  icons={
  blueflag: new google.maps.MarkerImage(
   // URL
   'images/flag2.png',
   // (width,height)
   new google.maps.Size( 44, 32 )
  ),
  new_stop_marker: new google.maps.MarkerImage(
   // URL
   'images/flag-grey.png',
   // (width,height)
   new google.maps.Size( 44, 32 ),
   null,
   // The origin point (x,y)
   // new google.maps.Point( 0, 0 ),
   // // The anchor point (x,y)
   new google.maps.Point( 22, 32 )
  ),
  new_stop_pointer: new google.maps.MarkerImage(
   // URL
   'images/flag-grey.png',
   // (width,height)
   new google.maps.Size( 44, 32 ),
   null,
   // The origin point (x,y)
   // new google.maps.Point( 0, 0 ),
   // // The anchor point (x,y)
   new google.maps.Point( 22, 32 )
   )

 };

    initMap();
    $.ajax({
      url: "/api/stops?tripid="+tripid,
      async: false,
      dataType: 'json',
      success: function(data) {
      if (data.stops.length==0) {
        //alert("no data!"); 
        return
      }
        //alert("data here!")
      stops = data.stops
    if(stops.length==1){
        var marker = new google.maps.Marker({
            position: {lat: stops[0].lat, lng: stops[0].lng},
            map: map,
            icon: icons.blueflag
        });
        send_data_plan(stops)
      }
      if(stops.length>1){
        send_route_map()
        create_stops_distinct()
        send_data_plan(stops)
        generateRequests(routeArray);
      }
      //send_data_plan(stops)
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
                    //stops[i].route=
                    stops[i]["route_index"]=index
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
            stops[0]["route_index"]=1
            routeArray["route1"].unshift({
                "lat": stops[0].lat,
                "lng": stops[0].lng
            })
            console.log("data stops")
            //console.log(stops)
            console.log(routeArray);
            //initMap(routeArray)
           
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
            }//end while
        }//end function
          }//end function(data)
    });//end ajax

    $.ajax(
      {url:"/api/tripdetail?tripid="+tripid,
      async: false,
      dataType: 'json',
      success: function(data) {
      if (!data.tripdetail) {return}
        tripdetail= data.tripdetail
        //$(".panel-body").append(data.tripdetail.description)

    }
    //end ajax
  });


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
    var string=""
    var stop_string ="<div class='content2'>\
        <ul class='content2-header'>\
          <li class='content2-header-item'><img id='avar' src='/images/flag2.png'> </li>\
          <li class='content2-header-item'><button class='function-button'>Up <span class='glyphicon glyphicon-arrow-up'></span></button></button></li>\
          <li class='content2-header-item'><button class='function-button'>Down <span class='glyphicon glyphicon-arrow-down'></span></button></li>\
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
$("#cancel-new-stop, .new-stop .close-button").click(function(){
  $(".new-stop").hide();
  $(".list-group .list-item").show();
});

//end document ready
});
$(".new-stop").hide();

        function send_data_plan(stops){

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


var map
var directionsService

var colourArray = ['navy', 'grey', 'fuchsia', 'black', 'white', 'lime', 'maroon', 'purple', 'aqua', 'red', 'green', 'silver', 'olive', 'blue', 'yellow', 'teal'];

//we have a array route to draw
// Let's make an array of requests which will become individual polylines on the map.
function generateRequests(jsonArray) {
    if(!jsonArray) return;
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
var renderArray = [];
function processRequests(requestArrayParam) {

    if(requestArrayParam.length==0) return false;
    for(var i=0; i<requestArrayParam.length; i++){
          renderArray[i] = new google.maps.DirectionsRenderer();
          renderArray[i].setMap(map);
          renderArray[i].setOptions({
                  suppressMarkers: true,
                  preserveViewport: true,
                  suppressInfoWindows: true,
                  polylineOptions: {
                      strokeWeight: 4,
                      strokeOpacity: 0.4,
                      strokeColor: 'blue'
                  },
                  markerOptions: {
                      icon: "images/flag2.png"
                      }
              });
        }
        i=0;
    function submitRequest() {
          directionsService.route(requestArrayParam[i].request, directionResults);
        }
    function directionResults(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            renderArray[i].setDirections(result);

            var legs= result.routes[0].legs;
  
            // get location of all stop
            for(var l=0;l<legs.length; l++){

               makeMarker(legs[l].start_location, icons.blueflag, stops_title[l]);
            }
            console.log("i="+i)
            if(i==0){
              console.log(legs[0])
            for(var step in legs[0].steps){
                console.log(legs[0].steps[step].instructions)
            }
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
 var maker = new google.maps.Marker({
  position: position,
  map: map,
  icon: icon,
  title: title

 });
 //map.panTo(latLng);
}

var nice_hotel = {
    lat: 11.9422612,
    lng: 108.4345293
}
var edit=false;
var geocoder;
// var directionsDisplay;
function initMap() {
    var mapOption = {
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        center: nice_hotel,
        mapTypeId: 'roadmap',
        //draggableCursor: 'url(images/flag-grey.png),auto;'
        //draggingCursor: 'url(images/flag-grey.png),auto;'
    };
    directionsService = new google.maps.DirectionsService;
    geocoder = new google.maps.Geocoder();
    //directionsDisplay = new google.maps.DirectionsRenderer();
    map = new google.maps.Map(document.getElementById('map'), mapOption);
   //directionsDisplay.setMap(map)

    addStop(map);
    addRoute(map, directionsService)
    //console.log(renderArray);
    // var request = {
    //         origin: {lat: 11.6680011, lng: 107.8481224},
    //         destination: {lat: 11.419862, lng: 107.5758401},
    //         waypoints:  [{location: { lat: 11.5881132, lng: 107.0890574 }, stopover: true}],
    //         travelMode: google.maps.TravelMode.DRIVING
    //   }; 
      // directionsService.route(request, function(result, status){
      //    if (status == google.maps.DirectionsStatus.OK) {
      //     var renderer= new google.maps.DirectionsRenderer()
      //     renderer.set(map)
      //     renderer.setOptions({
      //           suppressMarkers: true,
      //           preserveViewport: true,
      //           suppressInfoWindows: true,
      //           polylineOptions: {
      //               strokeWeight: 4,
      //               strokeOpacity: 0.4,
      //               strokeColor: 'blue'
      //           },
      //           markerOptions: {
      //               icon: "images/flag2.png"
      //               }
      //     });
      //     renderer.setDirections(result);
      //     console.log("pass");
      //    }
      // });




}
var markers=[];
var new_marker
function addStop(map){
  //click edit link event
  $("#edit-trip").click(function(e){
        if(!edit){
        edit= true;
         e.stopPropagation();
        map.setOptions({ draggableCursor: 'url(images/flag-grey.png) 22 32, auto' });
          }
          else{
            edit= false;
            map.setOptions({ draggableCursor: 'default' });
          }
        
    });
      //click event on map 
    map.addListener("click", function(e){
      if(edit){
        if(markers.length!=0){
          markers[0].setMap(null);
          markers.pop()
        }
      placeMarkerAndPanTo(e.latLng, map, icons.new_stop_marker);
      $(".list-group .list-item").hide();

      $(".new-stop input[name='stop-name']").val("")
             

      //var latlng = new google.maps.LatLng(-34.397, 150.644);
      geocoder.geocode({latLng: e.latLng}, function(responses){
            if (responses && responses.length > 0) {
                var address=responses[0].formatted_address;
                var lat=responses[0].geometry.location.lat();
                var lng=responses[0].geometry.location.lng();
                $(".new-stop input[name='stop-address']").attr('value',address);
                $(".new-stop input[name='stop-lat']").attr('value', lat)
                $(".new-stop input[name='stop-lng']").attr('value', lng)
                $(".new-stop").show();
                $(".new-stop input[name='stop-name']").focus();
               //console.log("in="+responses[0].formatted_address);
              }
              // else {
              //   //address="undefined";
              // }
      });

    }

    });
}

function placeMarkerAndPanTo(latLng, map, icon) {
  new_marker = new google.maps.Marker({
    position: latLng,
    map: map,
    icon: icon
  });
  //map.panTo(latLng);
  markers.push(new_marker)
}
function addRoute(map, directionsService){
  $("#save-new-stop").click(function(){
  //calulate and arrange stop to suitable position
  //...

  var stop_name=$(".new-stop input[name='stop-name']").val();
  var stop_arrive= 0
  var stop_departure=0
  var stop_address=$(".new-stop input[name='stop-address']").val();
  //remember get lat, long
  var stop_lat=parseFloat($(".new-stop input[name='stop-lat']").val())
  var stop_lng=parseFloat($(".new-stop input[name='stop-lng']").val())
  var new_stop_order=0
  var new_stop_latLng={lat:stop_lat, lng:stop_lng}
  // if no stop in map
  // no need to create route.
  new_stop_order=1
  stop_arrive=tripdetail.startdate;
  stop_departure=tripdetail.startdate+3600000
       var input={
            'name':stop_name,
            'address': stop_address,
            'arrive':stop_arrive,
            'departure': stop_departure,
            'order': new_stop_order,
            'lat': stop_lat,
            'lng': stop_lng,
            'tripid':tripid,
        };
  // if two or more stop in map
  if(stops.length==1){
    //new_stop_order=2;
    input.order=2
    var request={
      origin: {lat:stops[0].lat, lng:stops[0].lng},
      destination: new_stop_latLng,
      travelMode: google.maps.TravelMode.DRIVING
    };
    console.log("TH1: request=")
    console.log(request)

    directionsService.route(request, function(result, status){
      if(status==google.maps.DirectionsStatus.OK){
        var renderer= new google.maps.DirectionsRenderer()
        renderer.setMap(map);
        renderer.setOptions({
          suppressMarkers: true,
                preserveViewport: true,
                suppressInfoWindows: true,
                polylineOptions: {
                    strokeWeight: 4,
                    strokeOpacity: 0.4,
                    strokeColor: 'blue'
           }     
        });
        renderer.setDirections(result)
        //var leg= result.routes.legs[0]
        //input.route_name=leg.address

        // $.ajax({
        //   type: 'POST',
        //   dataType: 'json',
        //   url: '/api/addstop',
        //   contentType: 'application/json',
        //   data: JSON.stringify(input),
        //   success: function( data, textStatus, jQxhr ){
        //   console.log(data );
        //   },
        //   error: function( jqXhr, textStatus, errorThrown ){
        //   console.log(errorThrown );
        // }
        // });
      }//end if
      //end directionService
    });
    

  }
// console.log(stops.length)
  if(stops.length>1){
      var list_distance_stop=[]
      var new_latLng= new google.maps.LatLng({lat: stop_lat, lng: stop_lng})
      var latLng;

      //strange bug: if not generateRequests(jsonArray), error: google.maps.geometry was not init
      //calculate distance
      for(var i=0; i<stops.length;i++){
         latLng= new google.maps.LatLng({lat: stops[i].lat, lng:stops[i].lng})
      var distance_stop= {
        'route_index':stops[i].route_index,
        'order': stops[i].order,
        'latLng': {lat: stops[i].lat, lng:stops[i].lng},
        'distance': google.maps.geometry.spherical.computeDistanceBetween(new_latLng, latLng).toFixed(2)
      };
        list_distance_stop.push(distance_stop)
      }
      //to find the neareast stop
      list_distance_stop.sort(function(a,b){
          return a.distance-b.distance
      });
      // check if it lie in path or tangle
       var neareast_stop=list_distance_stop[0]
       var near_stop=list_distance_stop[1]
       var remove_route_index=neareast_stop.route_index;
        console.log(neareast_stop.route_index)
        // first stop of removed route
        var removed_route=routeArray["route"+remove_route_index]
        var first_stop_route=removed_route[0]
       var start_latLng={lat:first_stop_route.lat, lng:first_stop_route.lng}
       console.log(renderArray);
       console.log(remove_route_index);
      renderArray[remove_route_index].setMap(null);
      // var neareast_stop_latlng= new google.maps.LatLng(list_distance_stop[0].latLng)
      // var near_stop_latlng= new google.maps.LatLng(list_distance_stop[1].latLng)
      // // if(neareast_stop.order<)
      // var distance_near_nearest= google.maps.geometry.spherical.computeDistanceBetween(neareast_stop_latlng, near_stop_latlng).toFixed(2)
      // // lie in path
      // console.log(neareast_stop.latLng)
      // console.log(near_stop.latLng)
      // console.log("12="+distance_near_nearest)
      // console.log("13="+near_stop.distance)

      if(neareast_stop.order==stops.length){
          stop_order= neareast_stop.order+1;
          var request={
          origin: start_latLng,
          destination: new_stop_latLng,
          travelMode: google.maps.TravelMode.DRIVING
          };
          console.log("TH2: request=")
          console.log(request)
          directionsService.route(request, function(result, status){
              if(status==google.maps.DirectionsStatus.OK){
                var renderer= new google.maps.DirectionsRenderer()
                renderer.setMap(map);
                renderer.setOptions({
                  suppressMarkers: true,
                        preserveViewport: true,
                        suppressInfoWindows: true,
                        polylineOptions: {
                            strokeWeight: 4,
                            strokeOpacity: 0.4,
                            strokeColor: 'blue'
                   }     
                });
                renderer.setDirections(request)
              }//end if

            });
      }
      else{

          var near_stop_first, near_stop_second;
          var route_length= removed_route.length;
          var end_stop_route=routeArray["route"+remove_route_index][route_length-1]
          var end_latLng={lat:end_stop_route.lat, lng:end_stop_route.lng}
          //var near_stop_first;
          for(var ds in list_distance_stop){
              if(list_distance_stop[ds].order==neareast_stop.order-1){
                near_stop_first=list_distance_stop[ds];
              }
              if(list_distance_stop[ds].order==neareast_stop.order+1){
                near_stop_second=list_distance_stop[ds];
              }

          }  
          // console.log(near_stop_first)
          // console.log(near_stop_second)
          // var start;
            
          if(near_stop_first==undefined){
            // start=neareast_stop;

            new_stop_order=neareast_stop.order+1

          }
          else if(near_stop_second==undefined){
            // start= near_stop_first
            new_stop_order=neareast_stop.order-1

          }
          //new stop nghieng ve ben phai
          else if (near_stop_first.distance>near_stop_second.distance){
            // start=neareast_stop;
            new_stop_order=neareast_stop.order+1

          } 
          else{
            // start=near_stop_first;
            new_stop_order=neareast_stop.order-1

          } 

          // console.log(start)
          // console.log(end)

            var waypts=[]
           
            for(var i=1; i<removed_route.length-1;i++){
              if(new_stop_order-1==i){
                 waypts.push({
                    location:new_stop_latLng,
                    stopover:true})

              }
              waypts.push({
               location: removed_route[i],
                stopover: true})
            }
            //mot viec nua la cap nhat order cua cac stop sau nearest stop or new
            // waypts.push({
            //    location: new_stop,
            //     stopover: true})
           // console.log(new_stop)
           // console.log(start)
           //  console.log(end)
           //   console.log(new_stop)
          var request = {
                origin: start_latLng,
                destination: end_latLng,
                waypoints:  waypts,
                travelMode: google.maps.TravelMode.DRIVING
          }; 
          console.log("TH3: request");
          console.log(request)
          directionsService.route(request, function(result, status){
             if (status == google.maps.DirectionsStatus.OK) {
              var renderer= new google.maps.DirectionsRenderer()
              renderer.setMap(map)
              renderer.setOptions({
                    suppressMarkers: true,
                    preserveViewport: true,
                    suppressInfoWindows: true,
                    polylineOptions: {
                        strokeWeight: 4,
                        strokeOpacity: 0.4,
                        strokeColor: 'blue'
                    }
              });
              renderer.setDirections(result);
              console.log("pass");
             }
          });

         
      }//end else
      }//end if
new_marker.setIcon(icons.blueflag)


        // $.ajax({
        //   type: 'POST',
        //   dataType: 'json',
        //   url: '/api/addstop',
        //   contentType: 'application/json',
        //   data: JSON.stringify(input),
        //   success: function( data, textStatus, jQxhr ){
        //   console.log(data );
        //   },
        //   error: function( jqXhr, textStatus, errorThrown ){
        //   console.log(errorThrown );
        // }
        // });
      // $(".list-group .list-item").remove();
      //   $.ajax({
      //       url: "/api/stops?tripid="+tripid,
      //       async: false,
      //       dataType: 'json',
      //       success: function(data) {
      //       if (data.stops.length==0) {
      //         //alert("no data!"); 
      //         return
      //       }
      //       stops=data.stops
      //       send_data_plan(stops)
      //     }
      //   });
        $(".new-stop").hide();
        $(".list-group .list-item").show();

});

}