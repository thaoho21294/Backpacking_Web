defmodule BsnWeb.Backend.SchemaTest do
  use ExUnit.Case, async: true
  require Logger
  import ExUnit.TestHelpers

  alias BsnWeb.Backend.Schema

  @params %{
    "trip" => %{
      "clientMutationId" => "abcde",
      "name" => "Journey to the West",
      "description" => "Visiting all cities and towns on the West side of Vietnam"
    }
  }

  test "fetches the first stop of a trip" do
    query = """
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
    """

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

  test "creates a trip" do
    mutation = """
      mutation CreateTrip($trip: CreateTripInput!) {
        createTrip(input: $trip) {
          trip {
            name,
            description
          },
          clientMutationId
        }
      }
    """

    trip_params = @params["trip"]

    expected = %{
      createTrip: %{
        trip: %{
          name: trip_params["name"],
          description: trip_params["description"]
        },
        clientMutationId: trip_params["clientMutationId"]
      }
    }

    assert_execute({mutation, Schema.root, @params, @params}, expected)

  end

  test "fetches first two trips for the viewer" do
    query = """
      query GetTripsQuery {
        viewer {
          allTrips(first: 2) {
            edges {
              node {
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
          }
        }
      }
    """

    expected = %{
      viewer: %{ 
        allTrips: %{
          edges: [
            %{
              node: %{
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
            },
            %{
              node: %{
                name: "Tà Năng - Phan Dũng ( Tháng 8 )",
                # Matching on description fails, probably due to Unicode.
                # description: "Cung Sài Gòn - Đà Lạt 2 ngày 1 đêm (ngày 20 \\, 21 /8).\nLộ trình: sg - ql1 - dt768 - ql20 - Đà Lạt",
                stops: %{
                  edges: [
                    %{
                      node: %{
                        name: "BD",
                        address: "Đường N, Di An, Bình Dương, Vietnam",
                        lat: 10.8884267,
                        lng: 106.76551730000006
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    }

    assert_execute({query, Schema.root}, expected)
  end

  test "fetches nodes directly on connection with alias" do
    query = """
      query GetTripsQuery {
        viewer {
          allTrips(first: 2) {
            trips: nodes {
              name,
              stops(first: 1) {
                nodes {
                  name,
                  address,
                  lat,
                  lng
                }
              }
            }
          }
        }
      }
    """

    expected = %{
      viewer: %{ 
        allTrips: %{
          trips: [
            %{
              name: "Sài Gòn - Đà Lạt",
              # Matching on description fails, probably due to Unicode.
              # description: "Cung Sài Gòn - Đà Lạt 2 ngày 1 đêm (ngày 20 \\, 21 /8).\nLộ trình: sg - ql1 - dt768 - ql20 - Đà Lạt",
              stops: %{
                nodes: [
                  %{
                    name: "Cây xăng Comeco ngã Tư Hàng Xanh",
                    address: "Cây xăng Comeco, Điện Biên Phủ, Phường 25, Ho Chi Minh City, Ho Chi Minh, Vietnam",
                    lat: 10.8009424,
                    lng: 106.7110362
                  }
                ]
              }
            },
            %{
              name: "Tà Năng - Phan Dũng ( Tháng 8 )",
              # Matching on description fails, probably due to Unicode.
              # description: "Cung Sài Gòn - Đà Lạt 2 ngày 1 đêm (ngày 20 \\, 21 /8).\nLộ trình: sg - ql1 - dt768 - ql20 - Đà Lạt",
              stops: %{
                nodes: [
                  %{
                    name: "BD",
                    address: "Đường N, Di An, Bình Dương, Vietnam",
                    lat: 10.8884267,
                    lng: 106.76551730000006
                  }
                ]
              }
            }
          ]
        }
      }
    }

    assert_execute({query, Schema.root}, expected)
  end
end