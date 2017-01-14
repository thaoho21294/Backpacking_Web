
$(document).ready(function(){
var user_id= $("#user_id").val();
var trip_list=document.getElementById("my-trips")
if(trip_list!=undefined){
	$.ajax({
		url:"/api/trips/leader-view/"+user_id,
		dataType: 'json',
		success: function(data){
			drawTripList('#my-trips .trip-item-list', data.trips)
		},
		error: function( jqXhr, textStatus, errorThrown ){
        console.log(errorThrown );

    	}
	});//enđ ajax
}
});
function drawTripList(element, trips){
	var now_day=new Date();
	$(element).find('.trip-item').remove();
	if(trips.length==0) $(element).html("Không tìm thấy chuyến phượt nào! <a href='#'> Tạo ngay chuyến phượt của bạn!</a>");
	for(var trip in trips){
		$(element).append("<div class='trip-item'>\
				<a class='trip-link' href='/trips/"+trips[trip].id+"'></a>\
				<div class='status-label'>"+trips[trip].status+"</div>\
				<img src='"+trips[trip].background+"'>\
				<h4 class='trip-item-element'>"+trips[trip].name+"</h4>\
				<p class='trip-item-element'>"+formatDatetoDate(trips[trip].start_date)+" - "+formatDatetoDate(trips[trip].end_date)+"</p>\
				<p class='trip-item-element'><i class='fa fa-motorcycle' aria-hidden='true'></i> "+trips[trip].vehicle+"</p>\
	      <hr class='trip-item-element'>\
				<p class='trip-item-element'>đã đăng "+formatTimePeriod(trips[trip].created_date, now_day.getTime())+" trước</p>\
	      </div>");
		}//end for
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