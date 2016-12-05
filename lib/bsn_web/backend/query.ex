defmodule BsnWeb.Backend.Query do
  @moduledoc """
  Contains various queries used.
  """
  alias GraphQL.{Type, Relay}
  alias Relay.{Connection}
  alias BsnWeb.Backend
  alias Backend.Schema.{Trip, Route}

  def all_trips() do
    %{
      type: Trip.connection[:connection_type],
      description: """
      All the trips the viewer can see, which can include own trips if the 
      viewer is currently logged in.
      """,
      args: Map.merge(
        %{
          location: %{type: %Type.String{}},
          radius: %{type: %Type.Float{}, defaultValue: 50},
          unit: %{type: %Type.String{}, defaultValue: "km"} # Maybe enum?
        },
        Connection.args
      ),
      resolve: fn(viewer, args, context) ->
        args = Map.put(args, :type, "Trip")
        trips = Backend.retrieve(viewer, args, context)
        Connection.List.resolve(trips, args)
      end
    }
  end

  @doc """
  Retrieve a single trip by its ID.
  """
  def get_trip() do
    %{
      type: Trip.type,
      description: "Get a trip details by its ID",
      args: %{
        id: %{
          type: %Type.ID{},
          description: "The id of the trip"
        }
      },
      # `context` has fields [:field_name, :fragments, :root_value, :variable_values, :field_asts, :operation, :parent_type, :return_type, :schema]
      resolve: fn(source, args, context) ->
        args = Map.put(args, :type, "Trip")
        Backend.retrieve(source, args, context)
      end
    }
  end

  @default_route_arg %{
    origin: %{type: %Type.String{}}, # @TODO: Custom type
    destination: %{type: %Type.String{}},
    mode: %{type: %Type.String{}, defaultValue: "driving"} # Maybe enum?
  }

  @doc """
  GraphQL query for retrieving a list of routes.

  The returned list is either of routes surrounding a coordinate, or of
  a single trip. The `source` argument in the `resolve` is either the
  `viewer`, or a `trip`. 
  """
  def all_routes(args \\ @default_route_arg) do
    %{
      type: %Type.List{ofType: Route},
      description: "Direction routes for the trip",
      args: args || %{},
      resolve: fn(source, args, context) ->
        args = Map.put(args, :type, "Route")
        Backend.retrieve(source, args, context)
      end
    }
  end
end