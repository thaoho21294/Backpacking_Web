defmodule BsnWeb.MapController do
  use BsnWeb.Web, :controller
  use HTTPoison.Base

  def process_url(url) do
  	"https://maps.googleapis.com/maps/api/#{url}&key=AIzaSyDnPCkQMDmfgneX6juLvQ6rjBF98lyG5T0"
  end
  def process_response_body(body) do
  	#body |> IO.inspect |> Poison.decode!
  	body |> Poison.decode!
  end
  def index(conn, _params) do
  	response = get!("directions/json?origin=Toronto&destination=Montreal")
  	json(conn, response.body)

  end
  def get_autocomplete_data(conn, %{"input"=>input}) do
    response=get!("place/autocomplete/json?input=#{input}&components=country:vn")
    render(conn,"get_autocomplete_data.json", address: response.body)
    #json(conn,Map.get(response.body,"predictions"))
  end
  def get_location(conn, %{"place_id"=>place_id}) do
    response=get!("place/details/json?placeid=#{place_id}")
    render(conn,"get_location_data.json", location: response.body)
    #json conn, response
  end
  def get_direction(conn, %{"origin"=>origin, "destination"=>destination}) do
    response=get!("directions/json?origin=place_id:#{origin}&destination=place_id:#{destination}")
    render(conn, "get_direction.json", direction: response.body)
  end

end
