defmodule BsnWeb.MapView do
	use BsnWeb.Web, :view

	def render("get_autocomplete_data.json", %{address: address}) do
		%{address: Map.get(address,"predictions")}
	end
	def render("get_location_data.json", %{location: location}) do
		#.result.geometry.location
		%{location: Map.get(Map.get(Map.get(location,"result"),"geometry"),"location")}
	end
	def render("get_direction.json", %{direction: direction}) do
		%{direction: Map.get(direction, "routes")}
	end
end