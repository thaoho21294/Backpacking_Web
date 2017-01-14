defmodule BsnWeb.NotiView do
  use BsnWeb.Web, :view
  def render("get_noti.json", %{notifications: notifications}) do
  	%{notifications: notifications}
  end
end