defmodule BsnWeb.TripView do
    use BsnWeb.Web, :view
  def render("get_all_stops.json", %{stops: stops}) do
  %{stops: stops}
 end
 def render("get_trip_detail.json", %{tripdetail: tripdetail}) do
   %{tripdetail: tripdetail}
 end
 def render("get_member.json", %{members: members}) do
   %{members: members}
 end
end
