defmodule BsnWeb.Backend.Schema.Stop do
  # {
  #   "route_name":null,
  #   "route_duration":null,
  #   "route_distance":null,
  #   "order":1,
  #   "name":"Cây xăng Comeco ngã Tư Hàng Xanh",
  #   "mode":null,
  #   "lng":106.7110362,
  #   "lat":10.8009424,
  #   "description":null,
  #   "departure":1471633200000,
  #   "arrive":1471667400000,
  #   "address":"Cây xăng Comeco, Điện Biên Phủ, Phường 25, Ho Chi Minh City, Ho Chi Minh, Vietnam"
  # }
  
  alias GraphQL.{Type, Relay}
  alias Relay.{Connection, Node}

  alias BsnWeb.Backend.Schema

  def type() do
    %Type.ObjectType{
      name: "Stop",
      description: "A stop during the trip",
      fields: %{
        id: Node.global_id_field("stop"),
        name: %{
          type: %Type.String{},
          resolve: fn(obj, _args, _info) -> obj["name"] end
        },
        address: %{
          type: %Type.String{},
          resolve: fn(obj, _args, _info) -> obj["address"] end
        },
        lng: %{
          type: %Type.Float{},
          resolve: fn(obj, _args, _info) -> obj["lng"] end
        },
        lat: %{
          type: %Type.Float{},
          resolve: fn(obj, _args, _info) -> obj["lat"] end
        },
      },
      interfaces: [Schema.node_interface]
    }
  end

  def connection do
    %{
      name: "Stop",
      node_type: type,
      edge_fields: %{},
      connection_fields: Map.merge(Schema.connection_fields(type), %{}),
      resolve_node: nil,
      resolve_cursor: nil
    } |> Connection.new
  end
end