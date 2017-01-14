defmodule BsnWeb.UserView do
  use BsnWeb.Web, :view
  def render("friends_name.json", %{friends_name: friends_name}) do
  	%{friends_name: friends_name}
  end
  def render("get_simple_info.json", %{info: info}) do
  	info=Enum.at(info,0)
  	%{info: info}
  end

end