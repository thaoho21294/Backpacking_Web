defmodule BsnWeb.TripView do
    use BsnWeb.Web, :view
  def render("get_all_stops.json", %{stops: stops}) do
  %{stops: stops}
 end
 def render("show.json", %{tripdetail: tripdetail}) do
   %{tripdetail: tripdetail}
 end
 def render("get_members.json", %{members: members}) do
   %{members: members}
 end
 def render("get_all_routes.json", %{polylines: routes}) do 
 	%{routes: routes}
 end
end
