$(document).ready(function(){
  $(".modal-body input").val("")
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
  // $("#add-point").click(function (){
  //   var last_datalist_child=$(".next-point div:nth-last-child(1)").children('datalist.address-list')
  //   var last_datalist_id=last_datalist_child.attr('id')
  //   last_datalist_id=last_datalist_id.split('-');
  //   last_datalist_id=last_datalist_id[last_datalist_id.length-1]
  //   var next_datalist_id=parseInt(last_datalist_id)+1
  //   $(".next-point").append("<div class='input-group next-point-group'>\
  //     <input type='text' name='form-next-point' list='address-list-next-"+next_datalist_id+"' placeholder='Điểm đến tiếp theo...' class='address-input form-next-point form-control' id='form-next-point'>\
  //     <datalist class='address-list' id='address-list-next-"+next_datalist_id+"'></datalist>\
  //   <span class='input-group-btn'><button class='btn btn-default next-point-remove' type='button'><i class='fa fa-times' aria-hidden='true'>\
  //   </i></button></span></div>");
  // });

  $(".next-point-remove").click(function(){
    $(this).parents('.input-group').empty();
  });
  $(".next-point").on('click', '.next-point-remove',function(){
    $(this).parents('.input-group').empty();
  });
$("#form-start-point").on('input', function(){
  var val= this.value
  var place_id=$("#address-list-start").find("option[value=\""+val+"\"]").attr("data-value")
  if(place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"api/locations/"+place_id,
    dataType: 'json',
    success: function(data){
      console.log(data.location)
        $("input[name='start-lat']").val(data.location.lat)
        $("input[name='start-lng']").val(data.location.lng)

    }
    });
  }
});
$("#form-end-point").on('input', function(){
  var val= this.value
  var place_id=$("#address-list-end").find("option[value=\""+val+"\"]").attr("data-value")
  if(place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"api/locations/"+place_id,
    dataType: 'json',
    success: function(data){
      console.log(data.location)
        $("input[name='end-lat']").val(data.location.lat)
        $("input[name='end-lng']").val(data.location.lng)

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
  var autocomplete_string="";

  $('.form-location').on('keyup','.address-input',function(){
    var input=$(this).val()
    var datalist_id=$(this).attr('list')

    input= input.replace(' ', '+')
     $.ajax({
        url: "/api/locations/"+input,
        dataType: 'json',
        success: function(data){
          console.log(data)
          if(!data) return false;
          for(var ob in data.address){
            //console.log(ob.description)
            //autocomplete_data.push(ob.description)
            autocomplete_string+="<option data-value='"+data.address[ob].place_id+"' value=\""+data.address[ob].description+"\"></option>"
          }
          //$("#"+datalist_id).remove();
          $("#"+datalist_id).html(autocomplete_string);
      }
    });
      
  });
  $("#new-trip-form").submit(function(event){
    alert( "Handler for .submit() called." );
    var start_date=$("#form-start-date").val()
    var start_date_ms=new Date(start_date)
    var end_date=$("#form-end-date").val()
    var end_date_ms=new Date(end_date)
    //if date invalid=>just inorge
    $("#start-date-ms").val(start_date_ms.getMilliseconds())
    $("#end-date-ms").val(end_date_ms.getMilliseconds())
    var start={lat:$("input[name='start-lat']").val(), lng:$("input[name='start-lat']").val()}
    var end={lat:$("input[name='end-lat']").val(), lng:$("input[name='end-lat']").val()}
    //var mode_name=
    console.log(start_date_ms)
    console.log(end_date_ms)
    var request={
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
      };
      // console.log("TH1: request=")
      // console.log(request)
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
          var route_name= create_route_name(leg)
          var route_duration=Math.round(leg.duration.value/60)
          var route_distance=Math.round(leg.distance.value)
          $("#route-name").val(route_name)
          $("#route-distance").val(route_distance)
          $("#route-duration").val(route_duration)

          //send_new_stop_input(leg,input, new_stop_order)
        }//end if
        
      });//end directionService

      event.preventDefault();

    return
    //else
  });

});
