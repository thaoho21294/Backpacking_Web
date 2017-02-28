defmodule BsnWeb.Router do
  use BsnWeb.Web, :router

  @jwt_secret Application.get_env(:bsn_web, :jwt_secret)

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug BsnWeb.Plug.Jwt,
      secret: @jwt_secret,
      assign: :user
    #plug :scrub
  end

  scope "/", BsnWeb do
    pipe_through :browser # Use the default browser stack
    get "/registration", RegistrationController, :new
    post "/registration", RegistrationController, :create
    get "/", PageController, :index
    get "/new", SessionController, :new
    post "/login", SessionController, :create
    get "/logout", SessionController, :delete
    get "/map", MapController, :index

    scope "/trips" do
      get "/", PageController, :index
      get "/new", PageController, :create_trip
      get "/:id", PageController, :view_trip
      get "/:id/members/:noti_id", PageController, :view_members
    end

    get "/mytrips", PageController, :view_my_trips
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
    post "/stops/edit-route-mode/", TripController, :edit_route_mode
    post "/stops/edit_arrive_departure", TripController, :edit_arrive_departure_stop
    get "/stops/:id/images", TripController, :get_stop_images
    post "/add-stop-edit-route", TripController, :add_stop_edit_route
    post "/add-stop-update-order", TripController, :add_stop_update_order
    get "/address/:input", MapController, :get_autocomplete_data
    get "/locations/:place_id", MapController, :get_location
    get "/direction/:origin/:destination", MapController, :get_direction_by_placeid
    get "/direction-location/:origin/:destination/:mode", MapController, :get_direction_by_location

    scope "/trips" do
      get "/view/:user_id", TripController, :get_trips_near_user
      get "/view_province/:province", TripController, :get_trips_near_province
      get "/view-new-trips/:user_id", TripController, :get_trips_new
      get "/view-old-trips/:user_id", TripController, :get_trips_finish
      get "/leader-view/:user_id", TripController, :get_my_trips
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
      post "/:trip_id/delete_stop/:stop_id", TripController, :delete_stop

    end
    scope "/users" do
      get "/:id/simple_info", UserController, :get_simple_info
    end
    scope "/members" do
      post "/new", MemberController, :create
      post "/:id/update/:status", MemberController, :update
    end
    scope "/noti" do
      get "/:receiver_id", NotiController, :retrieve
    end
  end

  # Simple plug to scrub and escape string params.
  def scrub(conn, _opts) do
    params = Enum.map(conn.params, &scrub_param/1) |> Enum.into(%{})

    %{conn | params: params}
  end

  def scrub_param({k, v}) when is_binary(v) do
    {k, String.replace(v, "\\", "\\\\")}
  end
  def scrub_param(param), do: param
end
