defmodule BsnWeb.MemberController do
	use BsnWeb.Web, :controller
	alias BsnWeb.Backend

	def create(conn,%{"user-id"=>user_id, "trip-id"=>trip_id, "phone-number"=>phone_number, "slot"=>slot, "driver"=>driver}) do
		leader_id=Map.get(Enum.at(Backend.create(%{type: "Member", user_id: user_id, trip_id: trip_id, phone_number: phone_number,slot: slot,  driver: driver}),0),"leader_id")
		user_name=Map.get(Enum.at(Backend.retrieve(%{type: "UserSimpleInfo", user_id: user_id}),0),"full_name")
		IO.inspect(user_name)
		content=user_name <> " đã gửi yêu cầu tham gia chuyến phượt của bạn"
		response=Backend.create(%{type: "Noti", receiver_id: leader_id, sender_id: user_id, content_id: trip_id, content: content})
		 redirect(conn, to: "/trips/#{trip_id}")
	end
	def update(conn, %{"id"=>member_id, "status"=>status}) do
		response=Backend.update(%{type: "Member", member_id: member_id, status: status})
		json conn, response
	end
end