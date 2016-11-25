defmodule BsnWeb.Backend.Schema.Trip do

  alias GraphQL.{Type}
  alias GraphQL.Relay.Connection
  alias GraphQL.Relay.Node

  alias BsnWeb.Backend
  alias Backend.Schema

  def type() do
    %Type.ObjectType{
      name: "Trip",
      description: "A trip from one place to another, with stops in between.",
      fields: %{
        id: Node.global_id_field("trip", fn(obj, _, _) -> obj["id"] end),
        name: %{
          type: %Type.String{},
          resolve: fn(obj, _args, _info) -> obj["name"] end
        },
        description: %{
          type: %Type.String{},
          resolve: fn(obj, _args, _info) -> obj["description"] end
        },
        stops: %{
          type: Schema.Stop.connection[:connection_type],
          description: "Stops during the trip",
          args: Connection.args,
          resolve: fn(trip, args, context) ->
            args = Map.put(args, :type, "Stop")
            stops = Backend.retrieve(trip, args, context)
            Connection.List.resolve(stops, args)
          end
        }
      },
      interfaces: [Schema.node_interface]
    }
  end

  def connection do
    %{
      name: "Trip",
      node_type: type,
      edge_fields: %{},
      connection_fields: Map.merge(Schema.connection_fields(type), %{}),
      resolve_node: nil,
      resolve_cursor: nil
    } |> Connection.new
  end
end