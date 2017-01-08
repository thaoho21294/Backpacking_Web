defmodule BsnWeb.Backend.Schema.Position do
  alias GraphQL.{Type}
  
  def type() do
    %Type.ObjectType{
      name: "Position",
      description: "A position on Earth",
      fields: %{
        latitude: %{
          type: %Type.Float{},
          resolve: fn(obj, _args, _info) -> obj["latitude"] end
        },
        longitude: %{
          type: %Type.Float{},
          resolve: fn(obj, _args, _info) -> obj["longitude"] end
        }
      }
    }
  end
end