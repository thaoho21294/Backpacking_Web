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
  $(".add-point-area").append("<div class='input-group next-point-group'><input type='text' name='form-next-point' placeholder='Điểm đến tiếp theo...' class='form-next-point form-control' id='form-next-point'>"+
  "<span class='input-group-btn'><button class='btn btn-default next-point-remove ' type='button'><i class='fa fa-times' aria-hidden='true'></i></button></span></div>");
});
$(".next-point-remove").click(function(){
  $(this).parents('.input-group').empty();
});
$(".add-point-area").on('click', '.next-point-remove',function(){
  $(this).parents('.input-group').empty();
});
$(".start-date,.end-date").datetimepicker({
  format: "dd/mm/yyyy",
  autoclose: true,
  todayBtn: true,
  pickerPosition: "bottom-left",
  minView: 2 
});

  
});
