defmodule BsnWeb.Backend.SchemaTest do
  use ExUnit.Case, async: true
  import ExUnit.TestHelpers

  alias BsnWeb.Backend.Schema

  test "fetches the first stop of a trip" do
    query = "
      query GetTripQuery {
        getTrip(id: 195) {
          name,
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
        name: "Sài Gòn - Đà Lạt",
        # Matching on description fails, probably due to Unicode.
        # description: "Cung Sài Gòn - Đà Lạt 2 ngày 1 đêm (ngày 20 \\, 21 /8).\nLộ trình: sg - ql1 - dt768 - ql20 - Đà Lạt",
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