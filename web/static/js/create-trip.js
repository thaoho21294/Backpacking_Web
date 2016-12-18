$(document).ready(function(){
  //$(".modal-body input").val("")
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
  var start_place_id;
  var end_place_id;
$("#form-start-point").on('input', function(){
  var val= this.value
  start_place_id=$("#address-list-start").find("option[value=\""+val+"\"]").attr("data-value")
  if(start_place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"api/locations/"+start_place_id,
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
    url:"api/locations/"+end_place_id,
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


  $('.form-location').on('keyup','.address-input',function(){
    var input=$(this).val()
    var datalist_id=$(this).attr('list')

    input= input.replace(' ', '+')
     $.ajax({
        url: "/api/address/"+input,
        dataType: 'json',
        success: function(data){
          var autocomplete_string="";
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

    });//end ajax

  });
  $("#new-trip-form").on('submit.ajax', function(event){
    event.preventDefault();
    var form=this
    var  directionsService = new google.maps.DirectionsService;
    var start_date=$("#form-start-date").val()
    var start_date_ms=new Date(start_date)
    var end_date=$("#form-end-date").val()
    var end_date_ms=new Date(end_date)
    //if date invalid=>just inorge

    $("#start-date-ms").val(start_date_ms.getTime())
    $("#end-date-ms").val(end_date_ms.getTime())
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
        url:"api/direction/"+start_place_id+"/"+end_place_id,
        dataType: 'json',
        success: function(data){
         console.log(data.direction)
         var leg=data.direction[0].legs[0]

          var route_name= create_route_name(leg)
          var route_duration=Math.round(leg.duration.value/60)
          var route_distance=Math.round(leg.distance.value)
          console.log(route_name)
          console.log(route_duration)
          console.log(route_distance)
          $("#route-name").val(route_name)
          $("#route-distance").val(route_distance)
          $("#route-duration").val(route_duration)
          $(form).off('submit.ajax').submit();
          //send_new_stop_input(leg,input, new_stop_order)
        }
      });//end ajax
    
   });//end form submit


});
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