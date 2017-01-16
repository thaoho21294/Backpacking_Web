defmodule BsnWeb.Backend.Schema.User do
  alias GraphQL.{Type}
  alias GraphQL.Relay.Node

  alias BsnWeb.Backend
  alias Backend.Schema
  
  def type() do
    %Type.ObjectType{
      name: "User",
      description: "A user",
      fields: %{
        id: Node.global_id_field("user", fn(obj, _, _) -> obj["id"] end),
        name: %{
          type: %Type.String{},
          resolve: fn(obj, _args, _info) -> obj["full_name"] end
        },
        picture: %{
          type: %Type.String{},
          resolve: fn(obj, _args, %{root_value: %{url: endpoint}}) ->
            case URI.parse(obj["avatar"]) do
              %{host: nil} = uri -> 
                %{uri | scheme: endpoint.scheme, host: endpoint.host, port: endpoint.port}
              uri ->
                uri
            end
            |> URI.to_string
          end
        },
        level: %{
          type: %Type.Int{},
          resolve: fn(obj, _args, _info) -> obj["level"] end
        },
        progress: %{
          type: %Type.Float{},
          resolve: fn(obj, _args, _info) -> obj["progress"] end
        },
        position: %{
          type: Schema.Position,
          resolve: fn(obj, _args, _info) -> 
            %{
              "latitude" => obj["lat"],
              "longitude" => obj["lng"]
            }
          end
        }
      },
      interfaces: [Schema.node_interface]
    }
  end
end