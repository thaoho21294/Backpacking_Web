  
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
var tripid;
var routeArray = {}
var stops=[]
var stops_title=[]
var icons;
var tripdetail={}
// $.urlParam = function(name){
//     var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
//     if (results==null){
//        return null;
//     }
//     else{
//        return results[1] || 0;
//     }
// }
//var tripid=$.urlParam('tripid');

$(document).ready(function() {

  icons={
  blueflag: new google.maps.MarkerImage(
   // URL
   'images/flag2.png',
   // (width,height)
   new google.maps.Size( 40, 45 )
  ),
  new_stop_marker: new google.maps.MarkerImage(
   // URL
   'images/flag-grey.png',
   // (width,height)
   new google.maps.Size( 40, 45 ),
   null,
   // The origin point (x,y)
   // new google.maps.Point( 0, 0 ),
   // // The anchor point (x,y)
   new google.maps.Point( 20, 45 )
  ),
  new_stop_pointer: new google.maps.MarkerImage(
   // URL
   'images/flag-grey.png',
   // (width,height)
   new google.maps.Size( 40, 45 ),
   null,
   // The origin point (x,y)
   // new google.maps.Point( 0, 0 ),
   // // The anchor point (x,y)
   new google.maps.Point( 20, 45 )
   )

 };
    tripid=$("input[name='tripid']").val();
    initMap();
    $.ajax({
      url: "/api/trips/"+tripid+"/stops",
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
        send_route_map(stops)
        create_stops_distinct()
        send_data_plan(stops)
        generateRequests(routeArray);
      }
      //send_data_plan(stops)
      var center_stop= stops[Math.round(stops.length/2)]
      var center_latLng= {lat:center_stop.lat, lng:center_stop.lng}
      map.setCenter(center_latLng)
          }//end function(data)
    });//end ajax

    $.ajax(
      {url:"/api/trips/"+tripid+"/tripdetail",
      async: false,
      dataType: 'json',
      success: function(data) {
      if (!data.tripdetail) {return}
        tripdetail= data.tripdetail
        //$(".panel-body").append(data.tripdetail.description)

    }//end ajax
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

  $("#plan-list").find(".list-item .content2").remove();
  $("#plan-list").find(".content1").show();
  $(this).hide();
  //$(this).children(".content2").show();
  var stop_id= $(this).parents(".list-item").attr('id')
  var type=stop_id.split('_')[0];
  var id= stop_id.split('_')[1];
  var stop_arrive=new Date(stops[id].arrive)
  var stop_departure=new Date(stops[id].departure)
  var route_start=new Date(stops[id].arrive-stops[id].route_duration*60000)
  var route_finish=new Date(stops[id].arrive)
  var stop_duration= calulateStopDuration(stops[id].arrive, stops[id].departure)
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
               <label class='stop-label'>Thời gian đến</label><input type='text' name='stop-arrive-date' value='"+formatDatetoDate(stop_arrive)+"'>\
               <input type='text' name='stop-arrive-time' value='"+formatDatetoTime(stop_arrive)+"'>\
              </div>\
              <div class='item-content2'><label class='stop-label'>Thời gian trải qua:</label><input type='text' name='stop-duration-time' value="+stop_duration+"></div>\
              <div class='item-content2'>\
              <label class='stop-label'>Thời gian đi</label><input type='text' name='stop-departure-date' value='"+formatDatetoDate(stop_departure)+"'>\
              <input type='text' name='stop-departure-time' value='"+formatDatetoTime(stop_departure)+"'>\
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
              <label class='route-label'>Xuất phát: </label><input type='text' name='route-start-time' value='"+formatDatetoTime(route_start)+"'>\
          </div>\
              <div class='item-content2'>\
               <b>Khoảng cách:</b> <input type='text' name='route-distance' value='"+formatDistance(stops[id].route_distance)+"'>\
               <b>Thời gian:</b> <input type='text' name='route-duration-time' value='"+formatDuration(stops[id].route_duration)+"'>\
              </div>\
              <div class='item-content2'>\
              <label class='route-label'>Kết thúc</label><input type='text' name='route-departure-time' value='"+formatDatetoTime(route_finish)+"'>\
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
    $(this).parents(".list-item").children(".content1").show();
     $(this).parents(".content2").remove();



 });
$("#cancel-new-stop, .new-stop .close-button").click(function(){
  $(".new-stop").hide();
  $(".list-group .list-item").show();
});

//end document ready
});
$(".new-stop").hide();
        function send_route_map(stops) {
            //create routes include many stop
            var mode = stops[1].mode
            var start = 1,
                route_index = 1;
            if(stops.length==2){
              routeArray["route1"]=[]
              routeArray["route1"].push(stops[1])
              stops[1]["route_index"]=1
            }
            while (start < stops.length - 1) {
              routeArray["route" + route_index]=[]
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
                    stops[i]["route_index"]=route_index
                    //console.log(i)
                    //console.log(stops[i])
                    routeArray["route" + route_index].push({
                        "lat": stops[i].lat,
                        "lng": stops[i].lng
                    });
                    //increase start route
                    start = i + 1

                }
                route_index++
            }
            stops[0]["route_index"]=1
            routeArray["route1"].unshift({
                "lat": stops[0].lat,
                "lng": stops[0].lng
            })          
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
            console.log(stops_title)
        }//end function
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
          var route_start=new Date(stops[i].arrive-stops[i].route_duration*60000)
          var route_finish=new Date(stops[i].arrive)


          $("#plan-list").append("\
            <li class='list-item' id='route_"+i+"'>\
            <div class='content1'>\
            <ul class= 'route-list'>\
          <li class='route-item'>\
            "+stops[i].mode+"\
          </li>\
          <li class='route-item'>\
              "+formatDatetoTime(route_start)+"\
          </li>\
          <li class='route-item'>\
              "+formatDuration(stops[i].route_duration)+"/"+formatDistance(stops[i].route_distance)+"\
          </li>\
          <li class='route-item'>\
              "+formatDatetoTime(route_finish)+"\
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
    var duration = enddate_ms-startdate_ms;
    duration = duration/1000 //to second
   var second= Math.floor(duration%60)
    duration= duration/60
    var minutes = Math.floor(duration%60)
    duration= duration/60
    var hours= Math.floor(duration%60)
    var days = Math.floor(duration/24);
    if(days==0) {days=""} else{ days=days+'d'}
    if(hours==0) {hours="" }else {hours= hours+'h'}
    if(minutes==0) minutes="";
    return days+hours+minutes
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
    var i=0;
    function submitRequest() {
          directionsService.route(requestArrayParam[i].request, directionResults);
        }
    function directionResults(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            renderArray[i].setDirections(result);

            var legs= result.routes[0].legs;
            // get location of all stop
             //console.log(icons.blueflag)
            // console.log("stops_title="+stops_title)
            for(var l=0;l<legs.length; l++){

               makeMarker(legs[l].start_location, icons.blueflag, stops_title[l]);
            }

            
            // if(i==0){
            //   console.log(legs[0])
            // for(var step in legs[0].steps){
            //     console.log(legs[0].steps[step].instructions)
            // }legs.length-1
            //}
            if(i==requestArrayParam.length-1){
            makeMarker(legs[legs.length-1].end_location, icons.blueflag, stops_title[legs.length])
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
 var marker = new google.maps.Marker({
  position: position,
  map: map,
  icon: icon,
  title: title

 });
 //console.log(marker)
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
        zoom: 8,
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

    addStop(map)
    addRoute_LoadAgain(map,directionsService);
}
var markers=[];
var new_marker;
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


  //calulate and arrange stop to suitable position
  //...
var new_stop_route_index;
function addRoute_LoadAgain(map, directionsService){
$("#save-new-stop").click(function(){
        addRoute(map, directionsService)
        load_data_again();
      });
}
function addRoute(map, directionsService){
  var stop_name=$(".new-stop input[name='stop-name']").val();
  var stop_arrive= 0
  var stop_departure=0
  var stop_address=$(".new-stop input[name='stop-address']").val();
  //remember get lat, long
  var stop_lat=parseFloat($(".new-stop input[name='stop-lat']").val())
  var stop_lng=parseFloat($(".new-stop input[name='stop-lng']").val())
  var stop_description=$(".new-stop textarea").val()
  var new_stop_order=0
  var new_stop_latLng={lat:stop_lat, lng:stop_lng}
  var route_duration=0
  var route_distance=0
  var route_mode="xe máy"
  // if no stop in map
  // no need to create route.
  new_stop_order=1
  //cho nay sai
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
            'description': stop_description,
            'route_name': "",
            'route_distance': 0,
            'route_duration': 0,
            'route_mode':route_mode
        };
  // if two or more stop in map
  markers.pop()

  var dfrd=$.Deferred();
  setTimeout(function(){
    if(stops.length==0){
      console.log("TH 0");
    $.ajax({
          type: 'POST',
          dataType: 'json',
          url: '/api/addstop',
          contentType: 'application/json',
          data: JSON.stringify(input),
          success: function( data, textStatus, jQxhr ){
          console.log("update database done!");
          },
          error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown );
        }
        });

    }

    if(stops.length==1){
      //new_stop_order=2;
     new_stop_order=2
      var request={
        origin: {lat:stops[0].lat, lng:stops[0].lng},
        destination: new_stop_latLng,
        travelMode: google.maps.TravelMode.DRIVING
      };
      console.log("TH1: request=")
      console.log(request)
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
      directionsService.route(request, function(result, status){
        if(status==google.maps.DirectionsStatus.OK){
          
          renderer.setDirections(result)
          var leg= result.routes[0].legs[0]
          send_new_stop_input(leg,input, new_stop_order)
        }//end if
        //end directionService
      });
      renderArray.push(renderer)
    }
    console.log(stops.length)
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
         new_stop_route_index=remove_route_index
          console.log(neareast_stop.route_index)
          // first stop of removed route
          var removed_route=routeArray["route"+remove_route_index]
          var first_stop_route=removed_route[0]
         var start_latLng={lat:first_stop_route.lat, lng:first_stop_route.lng}
         console.log(renderArray);
         console.log(remove_route_index);
        renderArray[remove_route_index-1].setMap(null);
         renderArray[remove_route_index-1]= new google.maps.DirectionsRenderer()
         renderArray[remove_route_index-1].setMap(map);
         renderArray[remove_route_index-1].setOptions({
                    suppressMarkers: true,
                          preserveViewport: true,
                          suppressInfoWindows: true,
                          polylineOptions: {
                              strokeWeight: 4,
                              strokeOpacity: 0.4,
                              strokeColor: 'blue'
                     }     
                  });
         console.log(neareast_stop.order+"=="+stops.length)
        if(neareast_stop.order==stops.length){
          var waypts=[]
          for(var i=1; i< removed_route.length; i++){
              waypts.push({
                location: removed_route[i],
                stopover: true})
              
          }
          console.log(waypts)
            new_stop_order= stops.length+1;
            var request={
            origin: start_latLng,
            destination: new_stop_latLng,
            waypoints: waypts,
            travelMode: google.maps.TravelMode.DRIVING
            };
            console.log("TH2: request=")
            console.log(request)
            directionsService.route(request, function(result, status){
                if(status==google.maps.DirectionsStatus.OK){
                  renderArray[remove_route_index-1].setDirections(result)
                  var legs= result.routes[0].legs
                  var leg=legs[legs.length-1]
                  
                  send_new_stop_input(leg, input, new_stop_order)
                  

                }//end if

              });         
        }//end TH2
        else
        {
          var near_stop_first, near_stop_second;
          var route_length= removed_route.length;
          var end_stop_route=routeArray["route"+remove_route_index][route_length-1]
          var end_latLng={lat:end_stop_route.lat, lng:end_stop_route.lng}
          //var near_stop_first;
          console.log ("check list distance")
          console.log(list_distance_stop)
          console.log (neareast_stop.order)
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
              console.log ("check first, second distance")
              console.log (near_stop_first.distance)
              console.log (near_stop_second.distance)
            if(near_stop_first==undefined){ 
              // start=neareast_stop;

              new_stop_order=neareast_stop.order+1

            }
            else if(near_stop_second==undefined){
              // start= near_stop_first
              new_stop_order=neareast_stop.order

            }
            //new stop nghieng ve ben phai
            else if (near_stop_first.distance>near_stop_second.distance){
              // start=neareast_stop;
              new_stop_order=neareast_stop.order+1
            } 
            else{
              // start=near_stop_first;
              new_stop_order=neareast_stop.order

            }

            // console.log(start)
            // console.log(end)
          console.log("new order="+new_stop_order)

          var waypts=[]
          var index_input_route
          console.log("removed_route=")
          console.log(removed_route)
            if(removed_route.length==2){
              waypts.push({
              location:new_stop_latLng,
              stopover:true})
            }
              for(var i=0; i<removed_route.length;i++){
                console.log(i)
                if(new_stop_order-1==i){
                   waypts.push({
                      location:new_stop_latLng,
                      stopover:true})

                }
                if(i>0 && i<removed_route.length-1){
                waypts.push({
                 location: removed_route[i],
                  stopover: true})
              }
              }
              //mot viec nua la cap nhat order cua cac stop sau nearest stop or new

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
                renderArray[remove_route_index-1].setDirections(result);
                //console.log("pass");
                var legs= result.routes[0].legs
                var input_leg
                var edit_leg
                console.log(new_stop_latLng.lat)
                for(var leg in legs){
                  console.log(legs[leg].end_location.lat())
                  if(legs[leg].end_location.lat()==new_stop_latLng.lat){
                      input_leg=legs[leg]
                  }
                  if(legs[leg].start_location.lat()==new_stop_latLng.lat){
                    edit_leg=legs[leg]
                  }
                }

                send_new_stop_input(input_leg, input, new_stop_order)
                change_stop_order(tripid, new_stop_order)
                function edit_route(leg){
                    //get route name-----------------------------------
                    var input;
                    var instructions
                    var part_route_name
                    var split1
                    var same_part_route_name
                    for(var step in leg.steps){
                      instructions=leg.steps[step].instructions
                      //console.log(instructions)
                      split1=instructions.split("<b>")[2]
                      if(split1==undefined) split1=""
                      part_route_name=(split1).split("</b>")[0]
                      //console.log(part_route_name)
                      same_part_route_name=route_name.substring(route_name.length-part_route_name.length-3,route_name.length-3);
                      //console.log("same="+same_part_route_name)
                      if(part_route_name!="" && same_part_route_name!=part_route_name){
                        route_name+=part_route_name+" - "
                         //console.log()
                      }

                    }
                    var route_name=route_name.substring(0,route_name.length-3)
                    //end get route name-------------------------------
                    var route_duration=Math.round(leg.duration.value/60)
                    var route_distance=Math.round(leg.distance.value)
                    var route_mode="xe máy"
                    var stop_order=near_stop_second.order


                    //send data to controller
                    input.route_name=route_name
                    input.route_duration=route_duration
                    input.route_distance=route_distance
                    //input.route_mode=route_mode
                    input.stop_order=stop_order
                    input.tripid=tripid
                      $.ajax({
                          type: 'POST',
                          dataType: 'json',
                          url: '/api/add-stop-edit-route',
                          contentType: 'application/json',
                          data: JSON.stringify(input),
                          success: function( data, textStatus, jQxhr ){
                          //console.log(data );
                          },
                          error: function( jqXhr, textStatus, errorThrown ){
                          console.log(errorThrown );
                        }
                    });
                }//end function edit_route
              }//end if
            });//end directionService

        }//end else
    }//end if
  new_marker.setIcon(icons.blueflag)
  new_marker.setTitle(stop_name)
  console.log("Function 1 done!")
  dfrd.resolve();
  },0);
  return dfrd.promise();

}//end function add_route
function load_data_again(){
  console.log("load_data_again")
  $("#plan-list").find(".list-item").remove();
  var dfrd= $.Deferred();
  setTimeout(function(){

    $.ajax({
     url: "/api/trips/"+tripid+"/stops",
     async: false,
     dataType: 'json',
     success: function(data){
      stops=data.stops;
      console.log(stops)
    if(stops.length>1){
      send_route_map(stops)
      }
      send_data_plan(stops)
     }
    });    
    $(".new-stop").hide();
    console.log("function 2 done!")
  }, 2000);
  return dfrd.promise();
}
function send_new_stop_input(leg, input, new_stop_order){
       //get route name-----------------------------------
        var instructions
        var part_route_name
        var split1
        var same_part_route_name
        var route_name=""
        for(var step in leg.steps){
          instructions=leg.steps[step].instructions
          //console.log(instructions)
          split1=instructions.split("<b>")[2]
          if(split1==undefined) split1=""
          part_route_name=(split1).split("</b>")[0]
          //console.log(part_route_name)
          same_part_route_name=route_name.substring(route_name.length-part_route_name.length-3,route_name.length-3);
          //console.log("same="+same_part_route_name)
          if(part_route_name!="" && same_part_route_name!=part_route_name){
            route_name+=part_route_name+" - "
             //console.log()
          }

        }
        route_name=route_name.substring(0,route_name.length-3)
        //end get route name-------------------------------
        var route_duration=Math.round(leg.duration.value/60)
        var route_distance=Math.round(leg.distance.value)

        //send data to controller
        input.route_name=route_name
        input.route_duration=route_duration
        input.route_distance=route_distance
        input.order=new_stop_order
        input.arrive= stops[new_stop_order-2].departure+route_duration*60000
        input.departure=input.arrive + 3600000

        console.log("input=")
        console.log(input)
        $.ajax({
          type: 'POST',
          dataType: 'json',
          url: '/api/addstop',
          contentType: 'application/json',
          data: JSON.stringify(input),
          success: function( data, textStatus, jQxhr ){
          console.log("update database done!");
          },
          error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown );
        }
        });
}
function change_stop_order(tripid, new_stop_order){
  var input={
    'tripid': tripid,
    'new_stop_order': new_stop_order
  }
  $.ajax({
          type: 'POST',
          dataType: 'json',
          url: '/api/add-stop-update-order',
          contentType: 'application/json',
          data: JSON.stringify(input),
          success: function( data, textStatus, jQxhr ){
          //console.log(data );
          },
          error: function( jqXhr, textStatus, errorThrown ){
          console.log(errorThrown );
        }
        });
}