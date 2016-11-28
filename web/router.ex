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
    get "/trips/:id", PageController, :view_trip
    get "/createtrip", PageController, :create_trip
    get "/map", MapController, :index
    #get "/auto/:input", MapController, :get_auto_complete_data
  end
  # Other scopes may use custom stacks.
  scope "/api", BsnWeb do
    pipe_through :api

    # forward "/", Backend
    get "/", Backend, []
    post "/", Backend, []

     get "/trips/:id/stops", TripController, :get_all_stops
     get "/trips/:id", TripController, :get_trip_detail
     get "/trips/:id/members", TripController, :get_members
     post "/stops", TripController, :add_stop
     post "/add-stop-edit-route", TripController, :add_stop_edit_route
     post "/add-stop-update-order", TripController, :add_stop_update_order
     get "/address/:input", MapController, :get_autocomplete_data
     get "/locations/:place_id", MapController, :get_location
     get "/direction/:origin/:destination", MapController, :get_direction
     post "/addtrip", TripController, :add_trip

   end
end
