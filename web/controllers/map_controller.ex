defmodule BsnWeb.MapController do
  use BsnWeb.Web, :controller
  use HTTPoison.Base

  def process_url(url) do
  	"https://maps.googleapis.com/maps/api/directions/json?key=AIzaSyDnPCkQMDmfgneX6juLvQ6rjBF98lyG5T0&" <> url
  end
  def process_response_body(body) do
  	#body |> IO.inspect |> Poison.decode!
  	body |> Poison.decode!
  end
  def index(conn, _params) do
  	response = get!("origin=Toronto&destination=Montreal")
  	json(conn, response.body)

  end
end
