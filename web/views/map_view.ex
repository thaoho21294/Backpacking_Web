defmodule BsnWeb.MapView do
	use BsnWeb.Web, :view

	def render("get_autocomplete_data.json", %{address: address}) do
		%{address: Map.get(address,"predictions")}
	end
end