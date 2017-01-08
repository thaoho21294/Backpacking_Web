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
    get "/registration", RegistrationController, :new
    post "/registration", RegistrationController, :create
    get "/", PageController, :index
    get "/new", SessionController, :new
    post "/login", SessionController, :create
    get "/logout", SessionController, :delete
    get "/trips/new", PageController, :create_trip
    get "/trips/:id", PageController, :view_trip
    get "/map", MapController, :index
    #get "/auto/:input", MapController, :get_auto_complete_data
  end
  # Other scopes may use custom stacks.
  scope "/api", BsnWeb do
    pipe_through :api

    # forward "/", Backend
    get "/", Backend, []
    post "/", Backend, []

    post "/stops", TripController, :add_stop
    post "/stops/edit", TripController, :edit_stop
    post "/stops/edit-route", TripController, :edit_route
    post "/stops/edit_arrive_departure", TripController, :edit_arrive_departure_stop
    post "/add-stop-edit-route", TripController, :add_stop_edit_route
    post "/add-stop-update-order", TripController, :add_stop_update_order
    get "/address/:input", MapController, :get_autocomplete_data
    get "/locations/:place_id", MapController, :get_location
    get "/direction/:origin/:destination", MapController, :get_direction

  scope "/trips" do
      get "/view/:user_id", TripController, :get_trips_near_user
      get "/:id", TripController, :show
      get "/:id/stops", TripController, :get_all_stops
      post "/:id/stops", TripController, :add_stop
      get "/:id/members", TripController, :get_members
      get "/:id/routes", TripController, :get_all_routes
      post "/", TripController, :create
      delete "/:id", TripController, :delete
      post "/:id/members-location", TripController, :update_member_location
      post "/:id/edit", TripController, :edit_trip_detail
      post "/:id/edit-start-date/:start_date", TripController, :edit_trip_start_date
      post "/:id/edit-end-date/:end_date", TripController, :edit_trip_end_date
      post "/find", TripController, :find_trip

    end
    scope "/users" do
      post "/login/", UserController, :check_login
    end
  end
end
