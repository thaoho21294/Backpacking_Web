defmodule BsnWeb.Backend.Schema do
  alias GraphQL.{Schema, Type}
  alias GraphQL.Relay.Node

  alias BsnWeb.Backend
  alias Backend.Schema.{Trip}

  def root do
    %Schema{
      query: query,
      mutation: mutation
    }
  end

  def query do
    %Type.ObjectType{
      name: "Root",
      description: "The query root of this schema. See available queries.",
      fields: %{
        node: node_field,
        getTrip: %{
          type: Trip.type,
          description: "Get a trip details by its ID",
          args: %{
            id: %{
              type: %Type.ID{},
              description: "The id of the trip"
            }
          },
          resolve: fn(source, args, context) ->
            source
            |> Map.merge(%{"query" => "Trips"})
            |> Backend.get(args, context)
          end
        }
      }
    }
  end

  def mutation do
    %Type.ObjectType{
      name: "Mutation",
      description: "Root object for performing data mutations",
      fields: %{
        # updateTrip: Trip.update
      }
    }
  end

  def node_interface do
    Node.define_interface(fn(obj) ->
      case obj do
        %{stops: _stops} ->
          Backend.Schema.Trip.type
        _ ->
          Backend.Schema.User.type
      end
    end)
  end

  def node_field do
    Node.define_field(node_interface, fn (_item, args, _ctx) ->
      [type, id] = Node.from_global_id(args[:id])
      case type do
        "todo" ->
          Todo.GraphQL.Schema.Todo.find(id)
        _ ->
          Todo.GraphQL.Schema.User.find(id)
      end
    end)
  end
end