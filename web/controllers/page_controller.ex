defmodule BsnWeb.PageController do
  use BsnWeb.Web, :controller
  alias BsnWeb.Backend
  def index(conn, _params) do
    # conn=put_session(conn, :message, "new stuff we just set in the session")
    user_id = get_session(conn, :current_user)
    #text conn, message
     if user_id==nil do
      user_id=0
     end
     #  redirect(conn, to: session_path(conn, :new))
    #else
      render conn, "view-list-trips.html", user_id: user_id
    #end
  end
  def view_trip(conn, %{"id"=>trip_id}) do
    user_id= get_session(conn, :current_user)
    title="Xem chuyến phượt"
    sum_info=%{user_id: user_id, trip_id: trip_id,  view_members: false}
  	render(conn, "view-trip.html", sum_info: sum_info)

  end
  def view_my_trips(conn, _params) do
    user_id= get_session(conn, :current_user)
    render(conn, "my-trips.html", user_id: user_id)
  end
  def view_members(conn, %{"id"=>trip_id, "noti_id"=>noti_id}) do
    user_id= get_session(conn, :current_user)
    sum_info=%{user_id: user_id, trip_id: trip_id, view_members: true}
    Backend.update(%{type: "Noti", noti_id: noti_id})
    render(conn, "view-trip.html", sum_info: sum_info)
  end
end
