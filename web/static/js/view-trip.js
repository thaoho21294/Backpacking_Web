  
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
var tripid=0;
var routeArray = {}
var stops=[]
var stops_title=[]
var icons;
var tripdetail;
var members=[]
var route_mode={}
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
   '/images/flag2.png',
   // (width,height)
   new google.maps.Size( 40, 45 )
  ),
  new_stop_marker: new google.maps.MarkerImage(
   // URL
   '/images/flag-grey.png',
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
   '/images/flag-grey.png',
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
    
    if(tripid!=undefined){
      initMap();
      keep_position("#trip-detail");
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
        var center_stop= stops[Math.floor(stops.length/2)]
        var center_latLng= {lat:center_stop.lat, lng:center_stop.lng}
        map.setCenter(center_latLng)
            }//end furnction(data)
      });//end ajax
        $.ajax(
          {url:"/api/trips/"+tripid+"/members",
          async: false,
          dataType: 'json',
          success: function(data) {
          if (!data.members) {return}
            members= data.members;
          console.log(members);
            view_members(members);
        }
        });//end ajax
       $.ajax(
        {url:"/api/trips/"+tripid,
        async: false,
        dataType: 'json',
        success: function(data) {
        if (!data.tripdetail) {return}
          tripdetail= data.tripdetail
          create_tripdetail(tripdetail);
      }
    });//end ajax

  }
//event for plan-list
$("#plan-list").on('mouseenter', '.content1', function(){
  $(this).css('background-color','white')
});
$("#plan-list").on('mouseleave', '.content1', function(){
//  alert("leave");
  $(this).css('background-color','#f2f2f2')
});
$("#plan-list").on('click', '.content1', function(){

  $("#plan-list").find(".list-item .content2").remove();
  $("#plan-list").find(".content1").show();
  $(this).hide();
  //$(this).children(".content2").show();
  var stop_id= $(this).parents(".list-item").attr('id')
  var type=stop_id.split('_')[0];
  var id= stop_id.split('_')[1];
  var route_start=stops[id].arrive-stops[id].route_duration*60000
  var route_finish=stops[id].arrive
  var stop_duration= calulateStopDuration(stops[id].arrive, stops[id].departure)
  var string=""
  var stop_string ="<div class='content2'>\
        <ul class='content2-header'>\
          <li class='content2-header-item'><img id='avar' src='/images/flag2.png'> </li>\
          <li class='content2-header-item'><button class='function-button' id='up-stop'>Lên <span class='glyphicon glyphicon-arrow-up'></span></button></button></li>\
          <li class='content2-header-item'><button class='function-button' id='down-stop'>Xuống <span class='glyphicon glyphicon-arrow-down'></span></button></li>\
          <li class='content2-header-item'><button class='function-button' id='delete-stop'>Xóa <span class='glyphicon glyphicon-remove'></span></button></li>\
          <li class='li-close-button'><button class='close-button' id='close-stop'><span class='glyphicon glyphicon-remove'></span></button></li>\
        </ul>\
        <div class ='content2-body'>\
            <form class='stop-detail'>\
              <div class='item-content2'><input type='text' name='stop-name' id='stop-name-show' value='"+stops[id].name+"'></div>\
              <div class='item-content2'>\
              <input type='text' name='stop-address' class='address-input' list='address-list-show' id='stop-address-show' value='"+stops[id].address+"'>\
              <datalist   class='address-list' id='address-list-show'> </datalist>\
               <input type='hidden' id='show-lat' class='show-lat' value='' >\
               <input type='hidden' id='show-lng' class='show-lng' value='' >\
              </div>\
              <div class='item-content2'>\
               <label class='stop-label'>Thời gian đến</label><input type='text' disabled='true' name='stop-arrive-date' id='stop-arrive-date-show' value='"+formatDatetoDate(stops[id].arrive)+"'>\
               <input type='text' name='stop-arrive-time' id='stop-arrive-time-show' disabled='true' value='"+formatDatetoTime(stops[id].arrive)+"'>\
              </div>\
              <div class='item-content2'><label class='stop-label'>Thời gian trải qua:</label><input type='text' name='stop-duration-time' id='stop-duration-show' value="+stop_duration+"></div>\
              <div class='item-content2'>\
              <label class='stop-label'>Thời gian đi</label><input type='text' disabled='true' name='stop-departure-date' id='stop-departure-date-show' value='"+formatDatetoDate(stops[id].departure)+"'>\
              <input type='text' name='stop-departure-time' id='stop-departure-time-show' disabled='true' value='"+formatDatetoTime(stops[id].departure)+"'>\
              </div>\
              <div class='item-content2'><textarea class='stop-description' id='stop-description-show' placeholder='Stop description...'>"+stops[id].description+"</textarea></div>\
               </form>\
        </div>\
      </div>";
      var route_string="<div class='content2'>\
        <ul class='content2-header'>\
          <li class='content2-header-item'><button><img class='mode-icon' src='/images/moto-icon.png'></button></li>\
          <li class='li-close-button'><button class='close-button'><span class='glyphicon glyphicon-remove'></span></button></li>\
        </ul>\
        <div class ='content2-body'>\
            <form class='stop-detail'>\
          <div class='item-content2'><input type='text' name='route-name' value='"+stops[id].route_name+"'></div>\
          <div class='item-content2'>\
              <label class='route-label'>Xuất phát: </label><input type='text' disabled='true' name='route-start-time' value='"+formatDatetoTime(route_start)+"'>\
          </div>\
              <div class='item-content2'>\
               <b>Khoảng cách:</b> <input type='text' name='route-distance' disabled='true' value='"+formatDistance(stops[id].route_distance)+"'>\
               <b>Thời gian:</b> <input type='text' name='route-duration-time' id='route-duration-time' value='"+formatDuration(stops[id].route_duration)+"'>\
              </div>\
              <div class='item-content2'>\
              <label class='route-label'>Kết thúc</label><input type='text' id='route-departure-time' name='route-departure-time' disabled='true' value='"+formatDatetoTime(route_finish)+"'>\
              </div>\
              <div class='item-content2'><textarea class='stop-description' id='route-description-show' placeholder='Route description...'>"+stops[id].route_description+"</textarea></div>\
        </form>\
        </div>\
        </div>";

        if(type=="stop") string=stop_string
            else{
                string=route_string;
            }

      $(this).parents('.list-item').append(string);
      if(id==0){
        $("#stop-arrive-date-show").attr('disabled', false)
         $("#stop-arrive-time-show").attr('disabled', false)
      }   

});
$("#plan").on('input','#stop-arrive-date-show, #stop-arrive-time-show, #stop-duration-show', function(){
  var arrive_date=$('#stop-arrive-date-show').val();
  var arive_time=$('#stop-arrive-time-show').val();
  var stop_duration=0
  stop_duration=UnFormatDuration($("#stop-duration-show").val())*60000
  var arrive_ms=0
  arrive_ms=UnFormatOffTime(arive_time+" "+arrive_date);
  var departure_ms=0;
  // console.log(stop)
  if(arrive_ms!=0 && stop_duration!=0){
    departure_ms=arrive_ms+stop_duration;
  }
   $('#stop-departure-date-show').val(formatDatetoDate(departure_ms));
   $('#stop-departure-time-show').val(formatDatetoTime(departure_ms));
});

$('.trip-content-right').on('keyup','.address-input',function(){
    if(event.key=='ArrowDown') return;
    var input=$(this).val()
    var datalist_id=$(this).attr('list')
    input= input.replace(' ', '+')
     $.ajax({
        url: "/api/address/"+input,
        dataType: 'json',
        success: function(data){
          var autocomplete_string="";
          if(!data) return false;
            for(var ob in data.address){
              autocomplete_string+="<option class='address-item' data-value='"+data.address[ob].place_id+"' value=\""+data.address[ob].description+"\">"+data.address[ob].description+"</option>"
          }
        $("#"+datalist_id).html(autocomplete_string);
      }

    });//end aj
  });
$('#plan-list').on('input','#stop-address-show',function(){
  var val= this.value
  var place_id=$('#address-list-show').find("option[value=\""+val+"\"]").attr("data-value")
  if(place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"/api/locations/"+place_id,
    async: false,
    dataType: 'json',
    success: function(data){
      console.log(data.location)
        $("#show-lat").val(data.location.lat)
        $("#show-lng").val(data.location.lng)
    }
    });
    var array_address=val.split(',');
    $('#stop-name-show').val(array_address[1]);
  }

});
$('#plan-list').on('keyup','#route-duration-time',function(){
  var stop_id= $(this).parents(".list-item").attr('id');
  var id=stop_id.split("_")[1];
  var val=$(this).val();
  var route_departure= stops[id-1].departure+UnFormatDuration(val)*60000
  console.log(route_departure)
  $("#route-departure-time").val(formatDatetoTime(route_departure));
});
$('#plan-list').on('click', '#save-edit-stop', function(){
  var stop_id= $(this).parents(".list-item").attr('id');
  var array=stop_id.split("_");
  var id= parseInt(array[1])
  var type=array[0]
  if(type=='route'){
    stops[id].route_duration=UnFormatDuration($("#route-duration-time").val())
    stops[id].route_description=$("#route-description-show").val();
    UpdateRoute(stops[id].id, stops[id].route_duration, stops[id].route_description);
    stops[id].arrive=stops[id-1].departure+stops[id].route_duration*60000;
    stops[id].departure=stops[id].arrive+stops[id].duration;
    UpdateArriveDepartureStop(stops[id].id, stops[id].arrive, stops[id].departure);

  }else{
    var arrive_string=$('#stop-arrive-time-show').val()+" "+$('#stop-arrive-date-show').val()
    var stop_duration=UnFormatDuration($('#stop-duration-show').val())*60000
    var stop_arrive=UnFormatOffTime(arrive_string)
    var stop_departure=stop_arrive + stop_duration;
    console.log(stop_departure)
    stops[id].name=$("#stop-name-show").val();
    stops[id].arrive= stop_arrive;
    stops[id].departure=stop_departure
    stops[id].address=$("#stop-address-show").val();
    stops[id].description= $("#stop-description-show").val();
    stops[id].lat= $("#show-lat").val();
    stops[id].lng= $("#show-lng").val();

    UpdateStop(stops[id].id, stops[id].name, stops[id].arrive, stops[id].departure, stops[id].description,stops[id].address, stops[id].lat,stops[id].lng);
    if(id==0){
      tripdetail.start_date=stops[id].arrive; 
      UpdateTripStartDate(stops[id].arrive) 
    }
  }
  //update info other stops
  for (var i=id+1; i<stops.length; i++){
    stops[i].arrive=stops[i-1].departure+stops[i].route_duration*60000;
    stops[i].departure=stops[i].arrive+stops[i].duration;
    UpdateArriveDepartureStop(stops[i].id, stops[i].arrive, stops[i].departure);
    }
  tripdetail.end_date=stops[stops.length-1].arrive
  UpdateTripEndDate(stops[stops.length-1].arrive)
  $("#plan-list").find(".list-item").remove();
  $(".day-number li").remove();
  $("#schedule-table tr").remove();
  send_data_plan(stops);
  send_route_map(stops);
  create_tripdetail(tripdetail)
});
// edit route mode
$("#plan-list").on('click', '.close-button', function(e){
     e.stopPropagation()
    $(this).parents(".list-item").children(".content1").show();
     $(this).parents(".content2").remove();

 });
//-----------------------------------
//menu action
//-----------------------------------
//hover event on menu
$("#plan-menu").mouseover(function(){
  $(this).css("right", "-80px");
});
$("#plan-menu").mouseleave(function(){
  $(this).css("right", "-105px");
});
$("#schedule-menu").mouseover(function(){
  $(this).css("right", "-89px");
});
$("#schedule-menu").mouseleave(function(){
  $(this).css("right", "-119px");
});
$("#trip-menu").mouseover(function(){
  $(this).css("right", "-80px");
});
$("#trip-menu").mouseleave(function(){
  $(this).css("right", "-110px");
});

$("#members-menu").mouseover(function(){
  $(this).css("right", "-89px");
});
$("#members-menu").mouseleave(function(){
  $(this).css("right", "-105px");
});
$("#trip-menu").click(function(){
change_position("#trip-detail");
});
$("#plan-menu").click(function(){
  change_position("#plan");
});
$("#schedule-menu").click(function(){
  change_position("#schedule");
});
$("#members-menu").click(function(){
  change_position("#members");
});

$(".new-stop").hide();

$("#plan-list").on('click', '.list-item input, .list-item textarea', function(){
  $(this).parents(".content2").children('.content2-header').html("<li class='content2-header-item'><img id='avar' src='/images/flag2.png'></li>\
    <li class='content2-header-item'><button class='function-button' id='cancel-edit-stop'>Hủy <span class='glyphicon glyphicon-remove'></span></button></button></li>\
    <li class='content2-header-item'><button class='function-button' id='save-edit-stop'>Lưu <span class='glyphicon glyphicon-ok'></span></button></li>\
    <li class='li-close-button'><button class='close-button' id='close-stop'><span class='glyphicon glyphicon-remove'></span></button></li>");
});
$("#plan-list").on('click', '#cancel-edit-stop', function(){
  $(this).parents(".content2").children('.content2-header').html("<li class='content2-header-item'><img id='avar' src='/images/flag2.png'> </li>\
          <li class='content2-header-item'><button class='function-button' id='up-stop'>Lên <span class='glyphicon glyphicon-arrow-up'></span></button></button></li>\
          <li class='content2-header-item'><button class='function-button' id='down-stop'>Xuống <span class='glyphicon glyphicon-arrow-down'></span></button></li>\
          <li class='content2-header-item'><button class='function-button' id='delete-stop'>Xóa <span class='glyphicon glyphicon-remove'></span></button></li>\
          <li class='li-close-button'><button class='close-button' id='close-stop'><span class='glyphicon glyphicon-remove'></span></button></li>");
});
editTripDetail();
//end document ready
});
  //-------------------------------------
// START DEFINE FUNCTION
//------------------------------------
function change_position(element){
  $(".trip-content-right").css("right", "-500px");
  var view=$(element).css("right");
  if(view=="0px")
  $(element).css("right", "-500px");
else{
  $(element).css("right", "0px");
}
}
function keep_position(element){
  $(".trip-content-right").css("right", "-500px");
  var view=$(element).css("right");
  $(element).css("right", "0px");
}
function UpdateRoute(stop_id, route_duration, route_description){
  var input={
    stop_id:stop_id,
    route_duration: route_duration,
    route_description: route_description,
  }
  console.log(input)
      $.ajax({
    url: "/api/stops/edit-route/",
    type: 'POST',
    dataType: 'json',
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
function UpdateStop(stop_id, stop_name, stop_arrive, stop_departure, stop_description, stop_address, stop_lat, stop_lng ){
    var input={
    stop_id: stop_id,
    stop_name: stop_name,
    stop_arrive: stop_arrive,
    stop_departure: stop_departure,
    stop_description: stop_description,
    stop_address: stop_address,
    stop_lat: stop_lat,
    stop_lng: stop_lng
  }
  console.log(input);
  $.ajax({
    url: "/api/stops/edit",
    type: 'POST',
    dataType: 'json',
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
function UpdateArriveDepartureStop(stop_id, stop_arrive, stop_departure){
  var input={
    stop_id: stop_id,
    stop_arrive: stop_arrive,
    stop_departure: stop_departure
  }
  console.log(input);
    $.ajax({
    url: "/api/stops/edit_arrive_departure",
    type: 'POST',
    dataType: 'json',
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
function UpdateTripStartDate(start_date){
    $.ajax({
    url: "/api/trips/"+tripid+"/edit-start-date/"+start_date,
    type: 'POST',
    dataType: 'json',
    // contentType: 'application/json',
    // data: JSON.stringify(input),
    success: function( data, textStatus, jQxhr ){
        //console.log(data );
        },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log(errorThrown );

    }
  });
}
function UpdateTripEndDate(end_date){
    $.ajax({
    url: "/api/trips/"+tripid+"/edit-end-date/"+end_date,
    type: 'POST',
    dataType: 'json',
    success: function( data, textStatus, jQxhr ){
        //console.log(data );
        },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log(errorThrown );

    }
  });
}
var editTrip=false
function editTripDetail(){
  $("#trip-detail").on('click', '#enable-edit-trip', function(e){
        // if(!editTrip){
        // editTrip= true;
        //  e.stopPropagation();

          $("#trip-detail-title").html("<li class='content2-header-item'><button class='function-button' id='cancel-edit-trip'><span class='glyphicon glyphicon-remove'></span>CANCEL </button></li>\
            <li class='content2-header-item'><button class='function-button' type='submit' id= 'save-edit-trip'><span class='glyphicon glyphicon-ok'></span> SAVE </button></li>\
              <li class='li-close-button'><button class='close-button' id='close-button-edit-trip'><span class='glyphicon glyphicon-remove'></button></li>");
          $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").prop('disabled', false);
          $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name" ).css('border', '1px solid #ddd')
          // $(".trip-detail-content select").css({'-moz-appearance':'button-arrow-down', '-webkit-appearance': 'button-arrow-down'});
          // }
          // else{
          //   editTrip= false;
          //     // $("#trip-detail-title").hide();
          //     $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").prop('disabled', true);
          //     $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").css('border', '1px solid transparent')
          //     // $(".trip-detail-content select").css({'-moz-appearance':'none', '-webkit-appearance': 'none'});
          // }
        
    });
  $("#trip-detail").on('click', '#save-edit-trip', function(){
      editTrip=false;
     var input={
        trip_id: tripid,
        trip_name: $("#trip-name").val(),
        start_date: DateToMs($("#start-date").val()),
        end_date: DateToMs($("#end-date").val()),
        description: $("#trip-description").val(),
        estimated_cost: UnFormatMoney($("#estimated-cost").val()),
        estimated_members: parseInt($("#estimated-members").val()),
        cost_detail: $("#cost-detail").val(),
        off_time: UnFormatOffTime($("#off-time").val()),
        off_place: $("#off-place").val(),
        necessary_tool: $("#necessary-tool").val(),
        note: $("#note").val()
      }
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/api/trips/'+tripid+"/edit",
        contentType: 'application/json',
        data: JSON.stringify(input),
        success: function( data, textStatus, jQxhr ){
        //console.log(data );
        },
        error: function( jqXhr, textStatus, errorThrown ){
        console.log(errorThrown );
       }
      });//end ajax
      $("#trip-detail-title").html("<li class='content2-header-item'><button class='function-button' id='enable-edit-trip'><span class='glyphicon glyphicon-pencil'></span>EDIT </button></li>\
      <li class='content2-header-item'><button class='function-button' id='reset-edit-trip'><span class='glyphicon glyphicon-remove'></span>EXPORT</button></li>\
      <li class='li-close-button'><button class='close-button' id='close-button-edit-trip'><span class='glyphicon glyphicon-remove'></button></li>");
      $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").prop('disabled', true);
      $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").css('border', '1px solid transparent')

      });//end submit
      // $("#trip-detail").on('click', '', function(){
      //   $("#trip-detail-title").hide();
      //   create_tripdetail(tripdetail)
      // });
      $("#trip-detail").on('click', '#close-button-edit-trip, #cancel-edit-trip, #reset-edit-trip',function(){
        editTrip=false;
        $("#trip-detail-title").html("<li class='content2-header-item'><button class='function-button' id='enable-edit-trip'><span class='glyphicon glyphicon-pencil'></span>EDIT </button></li>\
      <li class='content2-header-item'><button class='function-button' id='reset-edit-trip'><span class='glyphicon glyphicon-remove'></span>EXPORT </button></li>\
      <li class='li-close-button'><button class='close-button' id='close-button-edit-trip'><span class='glyphicon glyphicon-remove'></button></li>");
        create_tripdetail(tripdetail)
        $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").prop('disabled', true);
        $(".trip-detail-content input, .trip-detail-content textarea, .trip-detail-content select, #trip-name").css('border', '1px solid transparent')
      });
      $("#trip-detail").on('keyup', 'textarea', function(){
          auto_height_textarea("#"+$(this).attr('id'), 20)
      } );
}
        function send_route_map(stops) {
            //create routes include many stop
            var mode = stops[1].mode
            route_mode["route1"]=mode;
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
                        route_mode["route"+route_index]=mode;
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
            //add route mode last
            route_mode["route"+(route_index-1)]=stops[stops.length-1].mode;
            stops[0]["route_index"]=1
            routeArray["route1"].unshift({
                "lat": stops[0].lat,
                "lng": stops[0].lng
            });        
             console.log(route_mode); 
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
          var image="flag2.png";
         $("#plan-list").append("<li class='list-item' id='stop_0'><div class='content1'><img id='avar' src='/images/start.png'>  "+stops[0].name+"</div></li>");
          stops[0].duration= stops[0].departure-stops[0].arrive
          for(var i=1; i<stops.length; i++){
            if(i==stops.length-1) image="end.png"
              var route_start=stops[i].arrive-stops[i].route_duration*60000
              var route_finish=stops[i].arrive
              stops[i].duration= stops[i].departure-stops[i].arrive
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
                <div class='content1'><img id='avar' src='/images/"+image+"'>  "+stops[i].name+"</div>\
                </li>");
             }//end for
              var items=[]
              var stop_description;
              var route_description;
              console.log(stops)
              for(var i=0;i<stops.length-1;i++){
                stop_description=stops[i].description;
                route_description=stops[i+1].route_description
                if(stop_description=="" || stop_description==null){
                  if(i==0){
                  stop_description="Tập trung tại "+stops[i].name;
                }
                else
                  stop_description="Tham quan "+stops[i].name;

                } 
                if(route_description==""|| route_description==null){
                  if(stops[i+1].mode=="xe máy") route_description="Lên xe máy đi "+stops[i+1].name;
                  if(stops[i+1].mode=="đi bộ") route_description="Đi bộ đến "+ stops[i+1].name;
                }

                items.push({time:stops[i].arrive,description:stop_description})

                items.push({time:stops[i].departure, description:route_description});
              }
              stop_description=stops[stops.length-1].description
              if(stop_description=="" || stop_description==null) stop_description="Kết thúc chuyến đi. Về lại "+stops[stops.length-1].name;

              items.push({time:stops[stops.length-1].arrive,description:stop_description});
              console.log("items=")
              console.log(items)
              var days=cal_number_days(stops)
              var start_date=new Date(stops[0].departure)
              var date=start_date; // date of daynumber
              var height_item=32; // height of a item on plan list
              var padding=0
              var number_item_part=0
              console.log("days="+days)
              var number_item=0;
              var day_max=0;
              var start_item_number=0;
              var month;
              var day_number_items=[];
              var day_string=""
             for(var i=1; i<days+1;i++){
              month=date.getMonth()+1
               $(".day-number").append("<li id='day"+i+"''>Day "+i+"<br>"+name_date(date.getDay())+"<br>"+date.getDate()+"/"+month+"</li>")
               var day_max=new Date(date.getFullYear(),date.getMonth(),date.getDate(),23,59,0,0).getTime();
               number_item=0;
                // console.log(day_max)
                for(var j=start_item_number; j<items.length; j++){
                  if(day_max<items[j].time){
                      number_item_part=(day_max-items[j-1].time)/(items[j].time-items[j-1].time);
                      start_item_number--;
                      number_item--;
                      break;
                  }
                  number_item++;
                  start_item_number++;
                }
                console.log(start_item_number);
                console.log(number_item)
                // console.log(number_item_part)
                // console.log(number_item+number_item_part)
                day_number_items.push(number_item);
                // console.log(day_number_items)
                padding=Math.round(height_item*(number_item+number_item_part))

               $("li#day"+i).css("height", padding+"px");
               date.setDate(date.getDate()+1);
             }
             create_schedule(items,days,day_number_items)

            }  //end send data map plan
function view_members(members){
  console.log(members);
  for(var i=0; i<members.length;i++){
    if(members[i].role=="leader"){
      $("#leaders-list").append("<li class='members-item'>\
        <div class='member-avatar'><img src=\""+members[i].avatar+"\"></div>\
        <div class='member-info'>\
          <div class='member-name'>"+members[i].full_name+"</div>\
          <div class='member-hometown'>"+members[i].hometown+"</div>\
          <div class='member-joined-date'>joined <span>"+formatDatetoDate(members[i].joined_date)+"</span></div>\
        </div>\
      </li>");
    }
    else{
      $("#members-list").append("<li class='members-item'>\
        <div class='member-avatar'><img src=\""+members[i].avatar+"\"></div>\
        <div class='member-info'>\
          <div class='member-name'>"+members[i].full_name+"</div>\
          <div class='member-hometown'>"+members[i].hometown+"</div>\
          <div class='member-joined-date'>joined <span>"+formatDatetoDate(members[i].joined_date)+"</span></div>\
        </div>\
      </li>");
    }
  }
}
function create_tripdetail(tripdetail){
  //console.log(tripdetail)
  var start_date=new Date(tripdetail.start_date);
  var trip_month_year=name_month(start_date.getMonth())+" "+start_date.getFullYear();
  var neading_member= tripdetail.estimated_members-members.length;
  if(tripdetail.description=="null") tripdetail.description="";
  if(tripdetail.cost_detail=="null") tripdetail.cost_detail=""
  if(tripdetail.off_time=='null') tripdetail.off_time="";
  if(tripdetail.off_place=='null') tripdetail.off_place="";
  if(tripdetail.necessary_tool=="null") tripdetail.necessary_tool="";
  if(tripdetail.note=='null') tripdetail.note="";

  var tripdetail_string="<ul class='content2-header' id='trip-detail-title'>\
  <li class='content2-header-item'><button class='function-button' id='enable-edit-trip'><span class='glyphicon glyphicon-pencil'></span>EDIT </button></li>\
  <li class='content2-header-item'><button class='function-button' id='reset-edit-trip'><span class='glyphicon glyphicon-remove'></span>EXPORT </button></li>\
  <li class='li-close-button'><button class='close-button' id='close-button-edit-trip'><span class='glyphicon glyphicon-remove'></button></li>\
   </ul>\
  <div class='trip-detail-header' style=\"background-image: url('"+tripdetail.background+"')\">\
<div class='trip-detail-header-background'>\
  <textarea class='trip-detail-name' disabled='true' id='trip-name' name='trip-name'>"+tripdetail.name+"</textarea>\
  <h3 class='trip-month'>"+trip_month_year+"</h3>\
  <p class='needing-member'>Needing "+neading_member+" members</p>\
  </div>\
</div>\
<div class='trip-detail-content'>\
  <div class='item-content2'>\
      <label class='trip-detail-item'>Status: </label><span>"+tripdetail.status+"</span>\
    </div>\
  <div class='item-content2'>\
    <label class='trip-detail-item'>Time: </label><input type='text' class='trip-detail-time' id='start-date' name='start-date' disabled='true' value='"+formatDatetoDate(tripdetail.start_date)+"'> - \
   <input type='text' class='trip-detail-time' id='end-date' name='end-date' disabled='true' value='"+formatDatetoDate(tripdetail.end_date)+"'>\
    </div>\
     <div class='item-content2'>\
      <label class='trip-detail-item'>Description</label><textarea name='trip-description' id='trip-description' disabled='true'>"+tripdetail.description+"</textarea>\
    </div>\
    <div class='item-content2'>\
      <label class='trip-detail-item'>Estimated Cost: </label><input type='text' id='estimated-cost' name='estimated-cost' disabled='true' value='"+formatMoney(tripdetail.estimated_cost)+"'><span>/1person</span>\
      </div>\
    <div class='item-content2'>\
      <label class='trip-detail-item'>Estimated Members: </label><input type='text' name='estimated_members' id='estimated-members' disabled='true' value='"+tripdetail.estimated_members+"'><span> persons</span>\
    </div>\
    <div class='item-content2'>\
      <label class='trip-detail-item'>Cost Detail:</label>\
      <textarea id='cost-detail' name='cost-detail' disabled='true'>"+tripdetail.cost_detail+"</textarea>\
    </div>\
    <div class='item-content2'>\
      <label class='trip-detail-item'>Off Time: </label><input type='text' name='off-time' id='off-time' disabled='true' value='"+formatDatetoTime(tripdetail.off_time)+" "+formatDatetoDate(tripdetail.off_time)+"'>\
    </div>\
    <div class='item-content2'>\
      <label class='trip-detail-item'>Off Place: </label><input type='text' name='off-place' id='off-place' disabled='true' value=\""+tripdetail.off_place+"\">\
    </div>\
         <div class='item-content2'>\
      <label class='trip-detail-item'>Necessary Tool: </label><textarea  name='necessary-tool' id='necessary-tool' disabled='true'>"+tripdetail.necessary_tool+"</textarea>\
    </div>\
         <div class='item-content2'>\
      <label class='trip-detail-item'>Note: </label><textarea id='note' name='note' disabled='true'>"+tripdetail.note+"</textarea>\
    </div>\
</div>";
$("#trip-detail").html(tripdetail_string);
  auto_height_textarea('#cost-detail', 20);
  auto_height_textarea('#trip-description',20);
  auto_height_textarea('#necessary-tool',20);
  auto_height_textarea('#note',20);
  auto_height_textarea('#trip-name',90);
}
function auto_height_textarea(textarea, one_line_height){
  var sum_line=0;
  var height=0;
  var text = $(textarea).val()
  var line_array=[];
  line_array=text.split("\n")
  var num_line=0
  for(var i=0;i<line_array.length; i++){
    num_line= Math.round(line_array[i].length/60);// a line have 60 character
    if (((line_array[i].length/60)-num_line)>0)
        num_line++;
    //console.log("num_line_last="+num_line);
    sum_line+=num_line;
  }
  height=sum_line*one_line_height;
  if(height==0 || height==20) height=30;
  $(textarea).css('height',height+"px");
}
function create_schedule(items,days,day_number_items){
  var number_item;
  var it=0;
  var day_string;
  var stop_number=0;
  var item_string=0;
  var start_it=0
  for(var i=1; i<days+1;i++){
    if(i>1){
        start_it=day_number_items[i-2];
    }
    $("#schedule-table").append("<tr><td rowspan="+day_number_items[i-1]+" style='background-color:white'>Day "+i+"</td>\
    <td class='period'>"+formatDatetoTime(items[start_it].time)+"</td>\
      <td class='item-description'>"+items[start_it].description+"</td>\
      </tr>");
      it++;
    for(var j=1;j<day_number_items[i-1];j++){
      $("#schedule-table").append("<tr><td class='period'>"+formatDatetoTime(items[it].time)+"</td>\
      <td class='item-description'>"+items[it].description+"</td>\
      </tr>");
      it++;
    }
  }
}
function DateToMs(date){
  var ms_date=0;
  var array=date.split("/");
  var day=array[0];
  var month=array[1];
  var year=array[2];
  var right_date=new Date(month+"/"+day+"/"+year);
  ms_date=right_date.getTime();
  return ms_date;
} 
function UnFormatMoney(money){
  var result=0;
  var last_word=money.charAt(money.length-1);
  if(last_word=='k'){
    result=money.split("k")[0]
  }
  if(last_word=='r'){
    result=money.split("tr")[0]
  }
  result=parseInt(result);
  return result;
}
function UnFormatOffTime(datetime){
  var time= datetime.split("m ")[0]
  var last_word=time[time.length-1]
  var hours=time.split(":")[0]
  var minutes=time.split(":")[1].split(" ")[0]
  hours=parseInt(hours);
  if(last_word=='p'){ 
    hours+=12;
  }
  var date=datetime.split("m ")[1];
  var ms_date=0;
  var array=date.split("/");
  var day=array[0];
  var month=array[1];
  var year=array[2];
  var str_date=year+"-"+month+"-"+day+"T"+hours+":"+minutes+":00";
  var right_date=new Date(str_date);

  return right_date.getTime();
}
function UnFormatDuration(duration){
  var result=0;
  var last_word=duration[duration.length-1]
  if(last_word=='p'){
   result=parseInt(duration.substring(0, duration.length-1));
  }
  else if(last_word=='h'){
    result=parseInt(duration.substring(0, duration.length-1))*60;
  }
  else{
    result=parseInt(duration.split("h")[0])*60+parseInt(duration.split("h")[1]);
  }
  return result;
}
function name_date(day){
  var weekday = new Array(7);
  weekday[0]=  "Sun";
  weekday[1] = "Mon";
  weekday[2] = "Tue";
  weekday[3] = "Wed";
  weekday[4] = "Thu";
  weekday[5] = "Fri";
  weekday[6] = "Sat";
  return weekday[day];
}
function name_month(month){
  var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[month];
}
function formatMoney(money){
  var result=0;
  if(money>999){
        result=(money/1000)+"tr"
  }
  else
    result= money+"k";
  return result;
}
function cal_number_days(stops){
  if(stops.length==0) return 0;
  if(stops.length==1) return 1;
  var days=0;
  var start_date=new Date(stops[0].departure);
  var end_date=new Date(stops[stops.length-1].arrive);
  var start_month=start_date.getMonth()+1;
  var end_month=end_date.getMonth()+1;
  var next_date=new Date(start_date);
  if(start_month==12){
    while(next_date.getMonth()+1>end_month){
      next_date.setDate(next_date.getDate()+1);
      days++;
    }
  }
  else{
    while(next_date.getMonth()+1<end_month){
      next_date.setDate(next_date.getDate()+1);
      days++;
    }
  }
  days+=end_date.getDate()-next_date.getDate()+1

  //console.log(enddate_ms-startdate_ms);
  //var days = (enddate_ms-startdate_ms)/(24*3600*1000); // 1day =24h
  //var floor_day=Math.floor(days)
  //var decimal_day=days-floor_day;
  // console.log(decimal_day)
  //if(decimal_day>=0) floor_day++;

  return days;
}

function formatDatetoDate(date_ms) {
  var date=new Date(date_ms)
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  //var strTime = hours + ':' + minutes + ' ' + ampm;
  return  + date.getDate() + "/" + (date.getMonth()+1) + "/"+ date.getFullYear();
  //return strTime
}
function formatDatetoTime(date_ms) {
  var date=new Date(date_ms);
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
    return Math.floor(distance/1000)+"km"
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
    if(minutes==0) {minutes=""} else {minutes=minutes+'p'};
    return days+hours+minutes
}
function getDuration(duration){
  var hours=0
  var minutes=0
  hours=duration.split(":")[0];
  minutes=duration.split(":")[1]
  // console.log("hours="+hours) 
  // console.log("minute"+minutes)
  if(hours=="") hours=0;
  if(minutes=="") minutes=0;
  hours=parseInt(hours)
  minutes=parseInt(minutes)
  return hours*3600000+minutes*60000
}
function tranModeName(mode){
  var result="";
  switch (mode){
    case "xe máy": 
      result= "DRIVING";
      break;
    case "xe khách":
      result= "DRIVING";
      break;
    case "xe đạp": 
      result= "BICYCLING";
      break;
    case "đi bộ": 
      result= "WALKING";
      break;
    default: result= "DRIVING";
  }
  return result;
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
            travelMode: google.maps.TravelMode[tranModeName(route_mode[route])]
        };
        console.log(tranModeName(route_mode[route]));
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
var add_stop=false;
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
        if(!add_stop){
        keep_position("#plan");
        add_stop= true;
         e.stopPropagation();
          map.setOptions({ draggableCursor: 'url(/images/flag-grey.png) 20 45, auto' });
          }
          else{
            add_stop= false;
          map.setOptions({ draggableCursor: 'default' });

          }
        
    });//end edit trip click
  
    if(map==undefined) return;
      //click event on map 
    map.addListener("click", function(e){
      if(add_stop){
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
                $(".new-stop input[name='stop-address']").val(address);
                $(".new-stop input[name='stop-lat']").val(lat)
                $(".new-stop input[name='stop-lng']").val(lng)
                $(".new-stop").show();
                var array_address=address.split(',');
                $(".new-stop input[name='stop-name']").val(array_address[1]);
                $(".new-stop input[name='stop-name']").focus();
               //console.log("in="+responses[0].formatted_address);
              }
              // else {
              //   //address="undefined";
              // }
      });


    }

    });//end map listener
    $('#plan-list').on('input','#stop-address-new',function(){
      var val= this.value
     var place_id=$('#address-list-new').find("option[value=\""+val+"\"]").attr("data-value")
      if(place_id!=undefined){
      //alert(data_value)
        $.ajax({
        url:"/api/locations/"+place_id,
        async: false,
        dataType: 'json',
        success: function(data){
          console.log(data.location)
            $("#new-lat").val(data.location.lat)
            $("#new-lng").val(data.location.lng)
                markers[0].setMap(null);
                markers.pop()
              placeMarkerAndPanTo(new google.maps.LatLng(data.location.lat, data.location.lng), map, icons.new_stop_marker);
            //remove current marker on map
            //draw new marker
        }
        });
        var array_address=val.split(',');
        $('#stop-name-new').val(array_address[1]);
      }

    });// end plan-list on....
    $("#cancel-new-stop, .new-stop .close-button").click(function(){
      markers[0].setMap(null);
      markers.pop()
      $(".new-stop").hide();
      $(".list-group .list-item").show();
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
        map.setOptions({ draggableCursor: 'default' });
        add_stop=false;
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
  var stop_duration=getDuration($(".new-stop input[name='stop-duration-time']").val())
  console.log(stop_duration)
  var new_stop_order=0
  var new_stop_latLng={lat:stop_lat, lng:stop_lng}
  var route_duration=0
  var route_distance=0
  var route_mode="xe máy"
  // if no stop in map
  // no need to create route.
  new_stop_order=1
  //cho nay sai
  stop_arrive=tripdetail.start_date;
  stop_departure=stop_arrive+stop_duration
  console.log(tripdetail)
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
      console.log("TH0");
    $.ajax({
          type: 'POST',
          dataType: 'json',
          url: '/api/stops',
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
     new_stop_order=2;

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
          send_new_stop_input(leg,input, new_stop_order, stop_duration)
        }//end if
        //end directionService
      });
      renderArray.push(renderer)
    }
    if(stops.length>1){
        var list_distance_stop=[]
        var new_latLng= new google.maps.LatLng({lat: stop_lat, lng: stop_lng})
        var latLng;
        var distance_term=0
        //strange bug: if not generateRequests(jsonArray), error: google.maps.geometry was not init
        //calculate distance
        for(var i=0; i<stops.length;i++){
           latLng= new google.maps.LatLng({lat: stops[i].lat, lng:stops[i].lng})
           distance_term=google.maps.geometry.spherical.computeDistanceBetween(new_latLng, latLng).toFixed(2)
        var distance_stop= {
          'route_index':stops[i].route_index,
          'order': stops[i].order,
          'latLng': {lat: stops[i].lat, lng:stops[i].lng},
          'distance': parseFloat(distance_term)
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
        //if(neareast_stop.order==stops.length){
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
                  
                  send_new_stop_input(leg, input, new_stop_order, stop_duration)
                  

                }//end if

              });         
        //}//end TH2
        // else
        // {
        //   var near_stop_first, near_stop_second;
        //   var route_length= removed_route.length;
        //   console.log(route_length)
        //   console.log(remove_route_index);
        //   console.log(routeArray);
        //   var end_stop_route=routeArray["route"+remove_route_index][route_length-1]
        //   var end_latLng={lat:end_stop_route.lat, lng:end_stop_route.lng}
        //   //var near_stop_first;
        //   console.log ("check list distance")
        //   console.log(list_distance_stop)
        //   console.log (neareast_stop.order)
        //   for(var ds in list_distance_stop){
        //         if(list_distance_stop[ds].order==neareast_stop.order-1){
        //           near_stop_first=list_distance_stop[ds];
        //         }
        //         if(list_distance_stop[ds].order==neareast_stop.order+1){
        //           near_stop_second=list_distance_stop[ds];
        //         }

        //   }  
        //     // console.log(near_stop_first)
        //     // console.log(near_stop_second)
        //     // var start;
        //       console.log ("check first, second distance")
        //       console.log (near_stop_first)
        //       console.log (near_stop_second)
        //     if(near_stop_first==undefined){ 
        //       new_stop_order=neareast_stop.order+1
        //       console.log("TH1: first undefined")
        //     }
        //     else if(near_stop_second==undefined){
        //       new_stop_order=neareast_stop.order
        //       console.log("TH2: second undefined")
        //     }
        //     else if (near_stop_first.distance>near_stop_second.distance){
        //       new_stop_order=neareast_stop.order+1
        //       console.log("TH3: first > second")
        //     } 
        //     else{
        //       new_stop_order=neareast_stop.order
        //       console.log("TH4: first < second")
        //     }

        //     // console.log(start)
        //     // console.log(end)
        //   console.log("new order="+new_stop_order)

        //   var waypts=[]
        //   var index_input_route
        //   console.log("removed_route=")
        //   console.log(removed_route)
        //     if(removed_route.length==2){
        //       waypts.push({
        //       location:new_stop_latLng,
        //       stopover:true})
        //     }
        //       for(var i=0; i<removed_route.length;i++){
        //         console.log(i)
        //         if(new_stop_order-1==i){
        //            waypts.push({
        //               location:new_stop_latLng,
        //               stopover:true})

        //         }
        //         if(i>0 && i<removed_route.length-1){
        //         waypts.push({
        //          location: removed_route[i],
        //           stopover: true})
        //       }
        //       }
        //       //mot viec nua la cap nhat order cua cac stop sau nearest stop or new

        //     var request = {
        //           origin: start_latLng,
        //           destination: end_latLng,
        //           waypoints:  waypts,
        //           travelMode: google.maps.TravelMode.DRIVING
        //     }; 
        //     console.log("TH3: request");
        //     console.log(request)
        //     directionsService.route(request, function(result, status){
        //       if (status == google.maps.DirectionsStatus.OK) {
        //         renderArray[remove_route_index-1].setDirections(result);
        //         //console.log("pass");
        //         console.log(result.routes[0].legs)
        //         var input_leg= result.routes[0].legs[new_stop_order-2]
        //         console.log(input_leg)
        //         send_new_stop_input(input_leg, input, new_stop_order, stop_duration)
        //         change_stop_order(tripid, new_stop_order)
        //         function edit_route(leg){
        //             //get route name-----------------------------------
        //             var input;
        //             var instructions
        //             var part_route_name
        //             var split1
        //             var same_part_route_name
        //             for(var step in leg.steps){
        //               instructions=leg.steps[step].instructions
        //               console.log(instructions)
        //               split1=instructions.split("<b>")[2]
        //               if(split1==undefined) split1=""
        //               part_route_name=(split1).split("</b>")[0]
        //               console.log(part_route_name)
        //               same_part_route_name=route_name.substring(route_name.length-part_route_name.length-3,route_name.length-3);
        //               //console.log("same="+same_part_route_name)
        //               if(part_route_name!="" && same_part_route_name!=part_route_name){
        //                 route_name+=part_route_name+" - "
        //                  //console.log()
        //               }

        //             }
        //             var route_name=route_name.substring(0,route_name.length-3)
        //             //end get route name-------------------------------
        //             var route_duration=Math.round(leg.duration.value/60)
        //             var route_distance=Math.round(leg.distance.value)
        //             var route_mode="xe máy"
        //             var stop_order=near_stop_second.order


        //             //send data to controller
        //             input.route_name=route_name
        //             input.route_duration=route_duration
        //             input.route_distance=route_distance
        //             //input.route_mode=route_mode
        //             input.stop_order=stop_order
        //             input.tripid=tripid
        //               $.ajax({
        //                   type: 'POST',
        //                   dataType: 'json',
        //                   url: '/api/add-stop-edit-route',
        //                   contentType: 'application/json',
        //                   data: JSON.stringify(input),
        //                   success: function( data, textStatus, jQxhr ){
        //                   //console.log(data );
        //                   },
        //                   error: function( jqXhr, textStatus, errorThrown ){
        //                   console.log(errorThrown );
        //                 }
        //             });
        //         }//end function edit_route
        //       }//end if
        //     });//end directionService

        // }//end else
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
  $(".day-number li").remove();
  $("#schedule-table tr").remove();
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
    });//end ajax
    $(".new-stop").hide();
    console.log("function 2 done!")
  }, 2000);
  return dfrd.promise();
}
function send_new_stop_input(leg, input, new_stop_order, stop_duration){

        var route_duration=Math.round(leg.duration.value/60)
        var route_distance=Math.round(leg.distance.value)
        var route_name= create_route_name(leg)
        //send data to controller
        input.route_name=route_name
        input.route_duration=route_duration
        input.route_distance=route_distance
        input.order=new_stop_order
        input.arrive= stops[new_stop_order-2].departure+route_duration*60000
        input.departure=input.arrive+stop_duration;

        console.log("input=")
        console.log(input)
        $.ajax({
          type: 'POST',
          dataType: 'json',
          url: '/api/stops',
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
          console.log(errorThrown);
        }
        });
}
function create_route_name(leg){
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
          if(route_name.length>100) break;

        }
  route_name=route_name.substring(0,route_name.length-3)
  return route_name
}