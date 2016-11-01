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
    #get "/routes", TripController, :get_routes_json
  end
  # Other scopes may use custom stacks.
  scope "/api", BsnWeb do
     pipe_through :api

     get "/stops", TripController, :get_all_stops
     get "/tripdetail", TripController, :get_trip_detail
     get "/members", TripController, :get_members

   end
end
