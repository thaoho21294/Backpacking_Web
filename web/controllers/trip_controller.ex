defmodule BsnWeb.TripController do
  use BsnWeb.Web, :controller
  alias Neo4j.Sips, as: Neo4j
  alias BsnWeb.Backend

  def get_all_stops(conn, %{"id"=>trip_id}) do
    stops = Backend.retrieve(%{"id"=>trip_id}, %{type: "Stop"}, nil)
    render(conn, "get_all_stops.json", stops: stops)
  end

  def get_all_routes(conn, %{"id"=>trip_id}) do
    routes = Backend.retrieve(%{"id" => trip_id}, %{type: "Route"}, nil)
    render(conn, "get_all_routes.json", routes: routes)
  end

  def show(conn, %{"id"=>trip_id})do
    trip = Backend.retrieve(nil, %{type: "Trip", id: trip_id}, nil)
    render(conn, "show.json", tripdetail: trip)
  end

  def get_members(conn, %{"id"=>trip_id}) do
    members=Backend.retrieve(%{id: trip_id}, %{type: "Member"}, nil)
    render(conn, "get_members.json", members: members)
  end
  def update_member_location(conn, %{"member_id"=>member_id, "lat"=>lat, "lng"=>lng}) do
    response=Backend.retrieve(%{type: "MemberLocation", member_id: member_id, lat: lat, lng: lng}, nil)
    json conn, response
  end
  def add_stop(conn, %{"name"=>name, "address"=>address, "arrive"=>arrive,"departure"=>departure, "order"=>order,"lat"=>lat, "lng"=>lng, "description"=>description, "tripid"=>trip_id,"route_name"=>route_name, "route_duration"=>route_duration, "route_distance"=>route_distance, "route_mode"=>route_mode}) do
    response=Backend.retrieve(%{id: trip_id}, %{type: "AddStop", name: name, address: address, arrive: arrive, departure: departure, order: order, lat: lat, lng: lng, description: description, route_name: route_name, route_duration: route_duration, route_distance: route_distance, route_mode: route_mode}, nil)
    json conn, response
  end
  def edit_route(conn, %{"name"=>name, "duration"=>duration, "distance"=>distance, "stop_order"=>stop_order, "tripid"=>trip_id}) do
    response=Backend.retrieve(%{id: trip_id}, %{type: "EditRoute", name: name, duration: duration, distance: distance, stop_order: stop_order})
    json conn, response
  end
  def add_stop_update_order(conn, %{"tripid"=>trip_id, "new_stop_order"=>new_stop_order}) do
    response=Backend.retrieve(%{id: trip_id}, %{new_stop_order: new_stop_order})
    json conn, response
  end
  def create(conn, %{"form-start-address"=>start_address,"start-lat"=>start_lat, "start-lng"=>start_lng,"form-end-address"=>end_address,"end-lat"=>end_lat, "end-lng"=>end_lng, "form-trip-name"=>trip_name,"start-date-ms"=>start_date, "end-date-ms"=>end_date, "form-estimate-cost"=>estimated_cost, "form-estimate-members"=>estimated_members,"holder-id"=>holder_id, "form-mode"=>mode,"route-name"=>route_name, "route-duration"=>route_duration, "route-distance"=>route_distance}) do
    response=Backend.retrieve(%{holder_id: holder_id}, %{type: "TripNew", start_address: start_address, start_lat: start_lat, start_lng: start_lng, end_address: end_address,end_lat: end_lat, end_lng: end_lng, trip_name: trip_name, start_date: start_date, end_date: end_date, estimated_cost: estimated_cost, estimated_members: estimated_members, mode: mode, route_name: route_name, route_duration: route_duration, route_distance: route_distance}) 
    trip_id=Map.get(Enum.at(response,0), "trip_id")
    redirect conn, to: "/trips/#{trip_id}"
  end
  def edit_trip_detail(conn, %{"trip_id"=>trip_id, "trip_name"=>trip_name, "start_date"=>start_date, "end_date"=>end_date, "description"=>description, "estimated_cost"=>estimated_cost, "estimated_members"=>estimated_members, "cost_detail"=>cost_detail, "off_time"=>off_time, "off_place"=>off_place, "necessary_tool"=>necessary_tool, "note"=>note}) do
    response=Backend.retrieve(%{id: trip_id}, %{type: "UpdateTripDetail",trip_name: trip_name, start_date: start_date, end_date: end_date, description: description, estimated_cost: estimated_cost, estimated_members: estimated_members, cost_detail: cost_detail, off_time: off_time, off_place: off_place, necessary_tool: necessary_tool, note: note}, nil)
    json conn, response
  end
end
