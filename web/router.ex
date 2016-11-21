defmodule BsnWeb.Router do
  use BsnWeb.Web, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", BsnWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    get "/viewtrip/:tripid", PageController, :view_trip
    get "/createtrip", PageController, :create_trip
    get "/map", MapController, :index
  end
  # Other scopes may use custom stacks.
  scope "/api", BsnWeb do
     pipe_through :api

     get "/trips/:tripid/stops", TripController, :get_all_stops
     get "/trips/:tripid/tripdetail", TripController, :get_trip_detail
     get "/trips/:tripid/members", TripController, :get_members
     post "/addstop", TripController, :add_stop
     post "/add-stop-edit-route", TripController, :add_stop_edit_route
     post "/add-stop-update-order", TripController, :add_stop_update_order
   end
end
