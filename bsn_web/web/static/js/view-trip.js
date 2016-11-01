var directionsService
var num, map, data;
var requestArray = [],
    renderArray = [];
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
$(document).ready(function() {
    // $.get("/api/stops?tripid=195", function(data) {
    //   if (!data) alert("no data!")
    //   stops = data.stops
    //   send_data_map()
    //   send_data_plan()
    //     function send_data_map() {
    //         var mode = stops[1].mode
    //         var start = 1,
    //             index = 1;
    //         while (start < stops.length - 1) {
    //             var route = []
    //             for (var i = start; i < stops.length; i++) {
    //                 if (stops[i].mode != mode) {
    //                     start = i
    //                     //console.log(start)
    //                     mode = stops[i].mode
    //                     break
    //                 }
    //                 route.push({
    //                     "lat": stops[i].lat,
    //                     "lng": stops[i].lng
    //                 })
    //                 start = i + 1
    //             }
    //             routeArray["route" + index] = route
    //             index++
    //         }
    //         routeArray["route1"].unshift({
    //             "lat": stops[0].lat,
    //             "lng": stops[0].lng
    //         })
    //         //console.log(routeArray)
    //         initMap(routeArray);
    //     }
    //     function send_data_plan(){
    //       $("#plan-list").append("<li class='list-group-item'><img id='avar' src='images/flag2.png'>"+stops[0].name+"</li>");
    //       for(var i=1; i<stops.length; i++){
    //       // var departure= new Date(stops[i].departure)
    //       // var arrrive = new Date(stops[i].arrive)
    //
    //       var start=new Date(stops[i].departure)
    //       var end = new Date(stops[i].arrive)
    //       start= formatDate(start)
    //       end= formatDate(end)
    //       $("#plan-list").append("\
    //       <li class='list-group-item'>\
    //         <ul class= 'route-list'>\
    //             <li class='route-item'>\
    //               "+stops[i].mode+"\
    //             </li>\
    //             <li class='route-item'>\
    //                 "+start+"\
    //             </li>\
    //             <li class='route-item'>\
    //                 "+formatDuration(stops[i].route_duration)+"/"+stops[i].route_distance/1000+"km\
    //             </li>\
    //             <li class='route-item'>\
    //                   "+end+"\
    //             </li>\
    //           </ul>\
    //       </li>\
    //       <li class='list-group-item'><img id='avar' src='images/flag2.png'>"+stops[i].name+"</li>");
    //     }
    //   }
    // }, "json");

    // $.get("/api/tripdetail?tripid=195", function(data) {
    //     if (!data.tripdetail) alert("no data!")
    //     $(".panel-body").append(data.tripdetail.description)
    //
    // }, "json");

});
$(".content2").hide()
//event for plan-list
$("#plan-list").on('mouseenter', '.list-group-item', function(){
  $(this).css('background-color','white')
});
$("#plan-list").on('mouseleave', '.list-group-item', function(){
//  alert("leave");
  $(this).css('background-color','#d3d3d3')
});
$("#plan-list").on('click', '.list-group-item', function(){
  $(this).children(".content1").hide();
  $(this).children(".content2").show();
});
$(".list-group-item").on('click', '.close-button', function(e){
     e.stopPropagation()
     $(this).parents(".content2").hide();
     //alert($(content2).html());
     $(".content1").show();
   //$(this).children(".content1").show();
 });
// $(".close-button").click(function(){
//     $('.content2').hide();
  // $(this).parent(".").hide();
  // $(this).children(".content1").show();
// });
function formatDate(date) {
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
// function formatdDstance(distance){
//   if (distance<1000)
//     return distance+"p"
//   else {
//     return ~~(distance/60)+"h"+distance%60
//   }
// }
var colourArray = ['navy', 'grey', 'fuchsia', 'black', 'white', 'lime', 'maroon', 'purple', 'aqua', 'red', 'green', 'silver', 'olive', 'blue', 'yellow', 'teal'];

//we have a array route to draw
// Let's make an array of requests which will become individual polylines on the map.
function generateRequests(jsonArray) {
    requestArray = [];
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
        processRequests();

    }
}

function processRequests() {
    var i = 0;
    function submitRequest() {
        directionsService.route(requestArray[i].request, directionResults);
    }

    function directionResults(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            // Create a unique DirectionsRenderer 'i'
            renderArray[i] = new google.maps.DirectionsRenderer();
            renderArray[i].setMap(map);

            // Some unique options from the colorArray so we can see the routes
            renderArray[i].setOptions({
                preserveViewport: true,
                suppressInfoWindows: true,
                polylineOptions: {
                    strokeWeight: 4,
                    strokeOpacity: 0.2,
                    strokeColor: 'blue'
                },
                markerOptions: {
                    icon: "images/flag2.png",
                    title: stops[i+1].name
                }
            });
            // Use this new renderer with the result
            renderArray[i].setDirections(result);
            // and start the next request
            nextRequest();
        }
    }

    function nextRequest() {
        // Increase the counter
        i++;

        // Make sure we are still waiting for a request
        if (i >= requestArray.length) {
            // No more to do
            return;
        }
        // Submit another request
        submitRequest();
    }
    // This request is just to kick start the whole process
    submitRequest();
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
    // var marker1 = new google.maps.Marker({
    //     position: dinh_pinhatt,
    //     icon: "images/flag2.png",
    //     map: map
    //
    //   });
}

// var cay_xang_comeco = [10.8009424, 106.7110362]
// var madagui = [11.419862, 107.5758401]
// var nice_hotel = [11.9422612, 108.4345293]
//
// $(document).ready(function() {
//     //  var data= $.get("/api/tripdetail?tripid=195", function(data){
//     //   if(!data.tripdetail) alert("no data!")
//     //   $(".panel-body").append("name: "+data.tripdetail.name)
//     // }, "json");
//     var map = new GMaps({
//         el: '#map',
//         lat: 11.419862,
//         lng: 108.4345293,
//         zoom: 7
//     });
//     var route1={
//         origin: cay_xang_comeco,
//         destination: madagui,
//         travelMode: 'driving',
//         strokeColor: '#131548',
//         strokeOpacity: 0.6,
//         strokeWeight: 6,
//         };
//     map.drawRoute(route1);
//     map.drawRoute({
//         origin: madagui,
//         destination: nice_hotel,
//         travelMode: 'driving',
//         strokeColor: '#131548',
//         strokeOpacity: 0.6,
//         strokeWeight: 6,
//
//     });
// });


// window.addEventListener('load',function(){
//
//   var script = document.createElement('script');
//   script.type = 'text/javascript';
//   script.src = 'https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyDnPCkQMDmfgneX6juLvQ6rjBF98lyG5T0&callback=initMap';
//   document.body.appendChild(script);
// });
