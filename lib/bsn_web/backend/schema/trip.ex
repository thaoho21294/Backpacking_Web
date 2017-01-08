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
        id: Node.global_id_field("trip", fn(trip, _, _) -> trip["id"] end),
        name: %{
          type: %Type.String{},
          resolve: fn(trip, _args, _info) -> trip["name"] end
        },
        description: %{
          type: %Type.String{},
          resolve: fn(trip, _args, _info) -> trip["description"] end
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
        },
        routes: Backend.Query.all_routes(nil),
        members: %{
          type: %Type.List{ofType: Schema.User},
          description: "Users participating in the trip",
          args: %{},
          resolve: fn(source, args, context) ->
            args = Map.put(args, :type, "Member")
            Backend.retrieve(source, args, context)
          end
        },
        start: %{
          # @TODO: Use DateTime type
          type: %Type.Float{},
          description: "The time in milliseconds on which the trip starts",
          resolve: fn(trip, _, _) -> trip["start_date"] end
        },
        end: %{
          # @TODO: Use DateTime type
          type: %Type.Float{},
          description: "The time in milliseconds on which the trip ends",
          resolve: fn(trip, _, _) -> trip["end_date"] end
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