defmodule BsnWeb.PageController do
  use BsnWeb.Web, :controller

  def index(conn, _params) do
    # conn=put_session(conn, :message, "new stuff we just set in the session")
    user_id = get_session(conn, :current_user)
    #text conn, message
     if user_id==nil do
       redirect(conn, to: session_path(conn, :new))
    else
      render conn, "view-list-trips.html", user_id: user_id
    end
  end
  def view_trip(conn, %{"id"=>tripid}) do
  	render(conn, "view-trip.html",tripid: tripid)
  end

end
