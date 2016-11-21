defmodule BsnWeb.PageController do
  use BsnWeb.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
  def view_trip(conn, %{"tripid"=>tripid}) do
  	render(conn, "view-trip.html",tripid: tripid)
  end
  def create_trip(conn, _params) do
  	render conn, "create-trip.html"
  end
end
