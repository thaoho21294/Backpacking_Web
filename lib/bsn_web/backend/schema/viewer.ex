defmodule BsnWeb.Backend.Schema.Viewer do
  @moduledoc """
  An object representing the current viewer.

  The idea here is that application’s data is fundamentally relative to 
  who is viewing it, so most of other fields nest within it. In 
  practice not all of data may change depending on the viewer, but 
  doing so gives the ability to change mind later.
  """
  alias GraphQL.{Type}
  alias GraphQL.Relay.Connection

  alias BsnWeb.Backend
  alias Backend.{Schema}

  defstruct token: nil, user: nil 

  @doc """
  The GraphQL type of the viewer
  """
  def type do
    %Type.ObjectType{
      name: "Viewer",
      description: "The current viewer",
      fields: %{
        user: %{
          type: %Type.String{},
          description: "The logged in user if any."
        },
        allTrips: %{
          type: Schema.Trip.connection[:connection_type],
          description: """
          All the trips the viewer can see, which can include own trips if the 
          viewer is currently logged in.
          """,
          args: Map.merge(
            %{
              "location" => %{type: %Type.String{}},
              "radius" => %{type: %Type.Float{}, defaultValue: 50},
              "unit" => %{type: %Type.String{}, defaultValue: "km"} # Maybe enum?
            },
            Connection.args
          ),
          resolve: fn(viewer, args, context) ->
            trips = Backend.retrieve(viewer, args, context)
            Connection.List.resolve(trips, args)
          end
        }
      }
    }
  end

  @doc """
  Generates a new viewer struct and authenticate if token provided.
  """
  def new(token \\ nil) do
    %__MODULE__{token: token}
  end
end