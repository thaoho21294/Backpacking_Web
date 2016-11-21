$(document).ready(function(){
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
      return false;
    }
    if ($("#fieldset3").is(":visible")){
        $("#fieldset3").hide();
        $("#fieldset2").show();
        $("#create-trip-next").html("Tiếp theo")
      }
  });
  $("#add-point").click(function (){
    var last_datalist_child=$(".next-point div:nth-last-child(1)").children('datalist.address-list')
    var last_datalist_id=last_datalist_child.attr('id')
    last_datalist_id=last_datalist_id.split('-');
    last_datalist_id=last_datalist_id[last_datalist_id.length-1]
    var next_datalist_id=parseInt(last_datalist_id)+1
    $(".next-point").append("<div class='input-group next-point-group'>\
      <input type='text' name='form-next-point' list='address-list-next-"+next_datalist_id+"' placeholder='Điểm đến tiếp theo...' class='address-input form-next-point form-control' id='form-next-point'>\
      <datalist class='address-list' id='address-list-next-"+next_datalist_id+"'></datalist>\
    <span class='input-group-btn'><button class='btn btn-default next-point-remove' type='button'><i class='fa fa-times' aria-hidden='true'>\
    </i></button></span></div>");
  });
  $(".next-point-remove").click(function(){
    $(this).parents('.input-group').empty();
  });
  $(".next-point").on('click', '.next-point-remove',function(){
    $(this).parents('.input-group').empty();
  });
  // $(".start-date,.end-date").datetimepicker({
  //   format: "dd/mm/yyyy",
  //   autoclose: true,
  //   todayBtn: true,
  //   pickerPosition: "bottom-left",
  //   minView: 2 
  // });
  var autocomplete_string="";

  $('.next-point').on('keyup','.address-input',function(){
    var input=$(this).val()
    var datalist_id=$(this).attr('list')
    input= input.replace(' ', '+')
     $.ajax({
        url: "/api/map/autocomplete/"+input,
        dataType: 'json',
        success: function(data){
          console.log(data)
          if(!data) return false;
          for(var ob in data.address){
            //console.log(ob.description)
            //autocomplete_data.push(ob.description)
            autocomplete_string+="<option value='"+data.address[ob].description+"'>"
          }

          $("#"+datalist_id).append(autocomplete_string);
      }
    });
      
  });
});
