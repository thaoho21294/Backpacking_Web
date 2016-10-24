defmodule BsnWeb.TripView do
    use BsnWeb.Web, :view
  def render("get_routes.json", %{routes: routes}) do
  %{routes: routes}
 end
 def render("get_trip_detail.json", %{tripdetail: tripdetail}) do
   %{tripdetail: tripdetail}
 end
 def render("get_member.json", %{members: members}) do
   %{members: members}
 end
end
