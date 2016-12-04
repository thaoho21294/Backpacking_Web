defmodule BsnWeb.Backend.Schema.Route do

  alias GraphQL.{Type}
  alias GraphQL.Relay.Node

  alias BsnWeb.Backend
  alias Backend.Schema
  
  def type() do
    %Type.ObjectType{
      name: "Route",
      description: "A route from one place to another, with waypoints in between.",
      fields: %{
        id: Node.global_id_field("route", fn(obj, _, _) -> obj["id"] end),
        polyline: %{
          type: %Type.String{},
          resolve: fn(obj, _args, _info) -> obj["name"] end
        }
      },
      interfaces: [Schema.node_interface]
    }
  end
end