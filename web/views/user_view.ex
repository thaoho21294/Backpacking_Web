defmodule BsnWeb.UserView do
  use BsnWeb.Web, :view
  def render("friends_name.json", %{friends_name: friends_name}) do
  	%{friends_name: friends_name}
  end
end