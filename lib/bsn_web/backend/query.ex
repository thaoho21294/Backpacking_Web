defmodule BsnWeb.Backend.Query do
  @moduledoc """
  Contains various queries used.
  """
  alias GraphQL.{Type}
  alias BsnWeb.Backend
  alias Backend.Schema.{Trip}

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
        source
        |> Map.merge(%{"query" => "Trips"})
        |> Backend.retrieve(args, context)
      end
    }
  end
end