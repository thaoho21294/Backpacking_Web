defmodule BsnWeb.NotiController do
	use BsnWeb.Web, :controller
	alias BsnWeb.Backend

	def create(conn, %{"receiver_id"=>receiver_id, "sender_id"=>sender_id, "content"=>content}) do
		response=Backend.create(%{type: "Noti", receiver_id: receiver_id, sender_id: sender_id, content: content})
		json conn, response
	end
	def retrieve(conn, %{"receiver_id"=>receiver_id}) do
		notifications=Backend.retrieve(%{type: "Noti", receiver_id: receiver_id})
		render(conn, "get_noti.json", notifications: notifications)
	end
	def update(conn, %{"noti_id"=>noti_id}) do
		response=Backend.update(%{type: "Noti", noti_id: noti_id})
		json conn, response
	end
end