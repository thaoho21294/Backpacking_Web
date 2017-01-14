// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";
require('jquery');
require('./view-trip.js');
require('./trips-list.js');
require('./my-trips.js');
$(document).ready(function(){
	$("#noti-list").hide();
	var user_id= $("#user_id").val();
	var trip_id= $("#tripid").val();
	if(user_id){
	$.ajax({
		url: "/api/users/"+user_id+"/simple_info",
		dataType: 'json',
		success: function(data){
			var info= data.info;
			console.log(info)
			$("#main-avatar").attr('src', info.avatar);
			$("#user-name-nav").html(" "+info.full_name)
		}
	});//end ajax
	$.ajax({
		url: "/api/noti/"+user_id,
		dataType: 'json',
		success: function(data){
			var noti=data.notifications;
			if(!noti || noti.length==0) return;
			console.log(noti)
			$(".noti").html(noti.length)
			for(var i in noti){
				$("#noti-list").append("<li><img class='plan-list-icon' src='"+noti[i].avatar+"'><a class='noti-link' href='/trips/"+noti[i].content_id+"/members/"+noti[i].id+"'>"+noti[i].content+"</a></li><hr>");
			}
			$("#noti-icon").css('color', 'white');


		}//end function

	});//end ajax #9d9d9d
	$("#noti-icon").click(function(){
		$("#noti-list").toggle();
		$("#noti-icon").css('color', '#9d9d9d');
		$(".noti").html("");
	});
	$(".content").click(function(){
		$("#noti-list").hide();
	});
	}//end if(user_id)
	if(!trip_id){
		$("#edit-trip").hide();
	}
});

// require('gmaps')

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
