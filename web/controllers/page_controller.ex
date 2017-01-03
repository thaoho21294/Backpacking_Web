defmodule BsnWeb.PageController do
  use BsnWeb.Web, :controller

  def index(conn, _params) do
    # conn=put_session(conn, :message, "new stuff we just set in the session")
    #user_id = get_session(conn, :user_id)
    #text conn, message
    #if user_id==nil do
      #render(conn, "login.html", message: "")
    #else
      render conn, "view-list-trips.html"
   # end
  end
  def view_trip(conn, %{"id"=>tripid}) do
  	render(conn, "view-trip.html",tripid: tripid)
  end

end
