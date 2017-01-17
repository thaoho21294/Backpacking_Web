$(document).ready(function(){
	$("#living-location").keyup(function(event){
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
  $("#hometown-location").keyup(function(event){
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

	$("#living-location").on('input', function(){
  var val= this.value
  var place_id=$("#location-list").find("option[value=\""+val+"\"]").attr("data-value")
  if(place_id!=undefined){
    //alert(data_value)
    $.ajax({
    url:"/api/locations/"+place_id,
    async: false,
    dataType: 'json',
    success: function(data){
      console.log(data.location)
        $("#living-lat").val(data.location.lat)
        $("#living-lng").val(data.location.lng)

    }
    });
  }
})
});