defmodule BsnWeb.Backend.SchemaTest do
  use ExUnit.Case, async: true
  import ExUnit.TestHelpers

  alias BsnWeb.Backend.Schema

  test "getTrip" do
    query = "
      query GetTripQuery {
        getTrip(id: 195) {
          stops(first: 1) {
            edges {
              node {
                name,
                address,
                lat,
                lng
              }
            }
          }
        }
      }
    "
    expected = %{
      getTrip: %{
        stops: %{
          edges: [
            %{
              node: %{
                name: "Cây xăng Comeco ngã Tư Hàng Xanh",
                address: "Cây xăng Comeco, Điện Biên Phủ, Phường 25, Ho Chi Minh City, Ho Chi Minh, Vietnam",
                lat: 10.8009424,
                lng: 106.7110362
              }
            }
          ]
        }
      }
    }
    assert_execute({query, Schema.root}, expected)
  end
end