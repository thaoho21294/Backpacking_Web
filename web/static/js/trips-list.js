var user_id= $("#user_id").val();
var now_day=new Date();

$(document).ready(function(){
	$("#find-trip-list").hide();
	$("#find-trip-location").keyup(function(event){
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
              autocomplete_string+="<option class='address-item' data-value='"+data.address[ob].place_id+"' value=\""+data.address[ob].description+"\"></option>"
          }
        $("#"+datalist_id).html(autocomplete_string);
      }

    });//end ajax
	});
	findDateInput("#find-trip-start-date", "#find-trip-end-date")
	findDateInput("#form-start-date", "#form-end-date")
	$("#find-trip-submit").click(function(event){
		event.preventDefault();
		$("#find-trip-list").show();
		var location=$("#find-trip-location").val();
		var start_date=DateToMs($("#find-trip-start-date").val());
		var end_date=DateToMs($("#find-trip-end-date").val());
		var input={
			location: location,
			start_date: start_date,
			end_date: end_date,
		};
		console.log(input);
		$.ajax({
			url:"/api/trips/find",
			type: 'POST',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(input),
			success: function( data, textStatus, jQxhr ){
        		drawTripList('#find-trip-list .trip-item-list', data.trips)
        	},
    		error: function( jqXhr, textStatus, errorThrown ){
        	console.log(errorThrown );
    		}
		});
	});
	//Load list trips from database
  var trip_list=document.getElementById("trip-near-you")
if(trip_list!=undefined){
	$.ajax({
		url:"/api/trips/view/"+user_id,
		dataType: 'json',
		success: function(data){
			drawTripList('#trip-near-you .trip-item-list', data.trips)
		},
		error: function( jqXhr, textStatus, errorThrown ){
        console.log(errorThrown );

    	}
	});//enđ ajax
}
	$("#trip-near-you").on('click', '.trip-item', function(){
		var url=$(this).children('a').attr('href')
		window.open(url);
	});
	$("#fieldset2").hide();
  $("#fieldset3").hide();
  $("#create-trip-back").hide();

  $("#create-trip-next").click(function(){
    if($("#fieldset1").is(":visible")){
    $("#fieldset1").hide();
    $("#fieldset2").show();
    $("#create-trip-back").show();
    return false;
  }

    if($("#fieldset2").is(":visible")){
     $("#fieldset2").hide();
    $("#fieldset3").show();
    $(this).html("Hoàn thành")
    $(this).attr('type', 'submit')
    return false;
  }
    if ($("#fieldset3").is(":visible")){
     $("#fieldset3").hide();
     $('#myModal').modal('toggle');
     }

  });
  $("#create-trip-back").click(function(){
    if($("#fieldset2").is(":visible")){
      $("#fieldset2").hide();
      $("#fieldset1").show();
      $(this).hide();
      //complete form

      return false;
    }
    if ($("#fieldset3").is(":visible")){
        $("#fieldset3").hide();
        $("#fieldset2").show();
        $("#create-trip-next").html("Tiếp theo")
        $("#create-trip-next").attr('type', 'button')
      }
  });
  $(".next-point-remove").click(function(){
    $(this).parents('.input-group').empty();
  });
  $(".next-point").on('click', '.next-point-remove',function(){
    $(this).parents('.input-group').empty();
  });
  var start_place_id;
  var end_place_id;
$("#form-start-point").on('input', function(){
  var val= this.value
  start_place_id=$("#address-list-start").find("option[value=\""+val+"\"]").attr("data-value")
  if(start_place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"/api/locations/"+start_place_id,
    async: false,
    dataType: 'json',
    success: function(data){
      console.log(data.location)
        $("#start-lat").val(data.location.lat)
        $("#start-lng").val(data.location.lng)

    }
    });
  }
});
$("#form-end-point").on('input', function(){
  var val= this.value
  end_place_id=$("#address-list-end").find("option[value=\""+val+"\"]").attr("data-value")
  if(end_place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"/api/locations/"+end_place_id,
    async: false,
    dataType: 'json',
    success: function(data){
      console.log(data.location)
        $("#end-lat").val(data.location.lat)
        $("#end-lng").val(data.location.lng)

    }
    });
  }

});


  // $(".start-date,.end-date").datetimepicker({
  //   format: "dd/mm/yyyy",
  //   autoclose: true,
  //   todayBtn: true,
  //   pickerPosition: "bottom-left",
  //   minView: 2 
  // });


  $('.form-location').on('keyup','.address-input',function(event){
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
              autocomplete_string+="<option class='address-item' data-value='"+data.address[ob].place_id+"' value=\""+data.address[ob].description+"\"></option>"
          }
        $("#"+datalist_id).html(autocomplete_string);
      }

    });//end ajax

  });
  $("#new-trip-form").on('submit.ajax', function(event){
    event.preventDefault();
    var form=this
    var  directionsService = new google.maps.DirectionsService;
    var start_date=$("#form-start-date").val()
    var start_date_ms=DateToMs(start_date)
    var end_date=$("#form-end-date").val()
    var end_date_ms=DateToMs(end_date)
    //if date invalid=>just inorge

    $("#start-date-ms").val(start_date_ms)
    $("#end-date-ms").val(end_date_ms)
    var start_lat=parseFloat($("#start-lat").val())
    var start_lng=parseFloat($("#start-lat").val())
    var end_lat=parseFloat($("#end-lat").val())
    var end_lng=parseFloat($("#end-lat").val())
    var start={lat: start_lat, lng:start_lng}
    var end={lat:end_lat, lng:end_lng}

    // console.log(start)
    // //var mode_name=
    // console.log(start_date_ms)
    // console.log(end_date_ms)
      // var dfrd=$.Deferred();
        // body...
      $.ajax({
        url:"/api/direction/"+start_place_id+"/"+end_place_id,
        dataType: 'json',
        success: function(data){
         if(!data) {
          alert("Somthing wrong, please do it again.");
          return;
         }
         var leg=data.direction[0].legs[0]
          var route_name= create_route_name(leg)
          var route_duration=Math.round(leg.duration.value/60)
          var route_distance=Math.round(leg.distance.value)
          var route_polyline=data.direction[0].overview_polyline.points;
          console.log(route_name)
          console.log(route_duration)
          console.log(route_distance)
          console.log(route_polyline)
          $("#route-name").val(route_name)
          $("#route-distance").val(route_distance)
          $("#route-duration").val(route_duration)
          $("#route-polyline").val(route_polyline)
          $(form).off('submit.ajax').submit();
          //send_new_stop_input(leg,input, new_stop_order)
        }
      });//end ajax
    
   });//end form submit
});

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
function formatTimePeriod(start_date, end_date){
	var days=0;
	var hours=0;
	var minutes=0;
	var month=0
	var subtract=end_date-start_date
	month=subtract/(24*3600*1000*30); 
	days=subtract/(24*3600*1000); // 1day =24h
	hours=subtract/(3600*1000)
	minutes=subtract/(60*1000)
	if(month>1) return Math.round(month)+ " tháng";
	if(days>1) return Math.round(days)+ " ngày";
	if(hours>1) return Math.round(hours)+ " giờ";
	if(minutes>1) return Math.round(minutes)+ " phút"
}
function findDateInput(start_date_id, end_date_id){
	var config={
		altInput: true,
		altFormat: "d/m/Y"
	}

	flatpickr(start_date_id,config);	
	flatpickr(end_date_id,config);
	$(start_date_id).change(function(){
		var start_date=$(this).val();
		config.minDate=start_date;
		flatpickr(end_date_id, config);
	});

}
function drawTripList(element, trips){
	$(element).find('.trip-item').remove();
	if(trips.length==0) $(element).html("Không tìm thấy chuyến phượt nào!");
	for(var trip in trips){
	$(element).append("<div class='trip-item'>\
			<a class='trip-link' href='/trips/"+trips[trip].id+"'></a>\
      <div class='status-label'>"+trips[trip].status+"</div>\
			<img src='"+trips[trip].background+"'>\
			<h4 class='trip-item-element'>"+trips[trip].name+"</h4>\
			<p class='trip-item-element'>"+formatDatetoDate(trips[trip].start_date)+" - "+formatDatetoDate(trips[trip].end_date)+"</p>\
			<p class='trip-item-element'><i class='fa fa-motorcycle' aria-hidden='true'></i> "+trips[trip].vehicle+"</p>\
      <p class='trip-item-element'><i class='fa fa-user' aria-hidden='true'></i><a href='#' class='leader-name'> "+trips[trip].leader_name+"</a></p>\
      <hr class='trip-item-element'>\
			<p class='trip-item-element'>đã đăng "+formatTimePeriod(trips[trip].created_date, now_day.getTime())+" trước</p>\
      </div>");
			}
}
function DateToMs(date){
	var ms_date=0;
	var right_date=new Date(date+" 00:00");
	ms_date=right_date.getTime();
	return ms_date;
} 
function create_route_name(leg){
  var instructions
  var part_route_name
  var split1
  var same_part_route_name
  var route_name=""
  for(var step in leg.steps){
          instructions=leg.steps[step].html_instructions
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
  return route_name
}
