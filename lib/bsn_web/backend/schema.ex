defmodule BsnWeb.Backend.Schema do
  alias GraphQL.{Schema, Type}
  alias GraphQL.Relay.Node

  alias BsnWeb.Backend
  alias Backend.Schema.{Viewer, Trip, Stop}
  alias Backend.{Query, Mutation}

  @doc """
  The root GraphQL Schema with Relay.

  A GraphQL Relay server must reserve certain types and type names to 
  support the object identification model used by Relay. In particular,
  this spec creates guidelines for the following types:

  - An interface named Node.
  - The node field on the root query type.
  """
  def root do
    %Schema{
      query: query,
      mutation: mutation
    }
  end

  def query do
    %Type.ObjectType{
      name: "GenBackendQueryRoot",
      description: "The query root of this schema. See available queries.",
      fields: %{
        node: node_field,
        viewer: %{
          type: Viewer.type(%{
            # The active trip of the viewer, if any.
            trip: Query.get_trip(),
            # All the trips the viewer can see.
            allTrips: Query.all_trips
          }),
          args: %{
            token: %{
              type: %Type.String{},
              description: "The optional token used to identify a user."
            }
          },
          resolve: fn
            (_source, %{token: token}, _context) ->
              Viewer.new(token)
            (_source, _args, _context) ->
              Viewer.new()
          end
        },
        getTrip: Query.get_trip()
      }
    }
  end

  def mutation do
    %Type.ObjectType{
      name: "GenBackendMutationRoot",
      description: "Root object for performing data mutations",
      fields: %{
        createTrip: Mutation.create_trip(),
        createToken: Mutation.create_token()
      }
    }
  end

  @doc """
  The server must provide an interface called Node.

  That interface must include exactly one field, called `id` that 
  returns a non‐null ID.

  This `id` should be a globally unique identifier for this object, 
  and given just this `id`, the server should be able to refetch 
  the object.
  """
  def node_interface do
    resolver = fn(obj) ->
      case obj do
        %{stops: _stops} ->
          Trip.type
        _ ->
          Stop.type
      end
    end

    Node.define_interface(resolver)
  end

  @doc """
  The server must provide a root field called node that returns
  the Node interface. This root field must take exactly one 
  argument, a non‐null ID named `id`.
  """
  def node_field do
    Node.define_field(node_interface, fn (item, args, context) ->
      [type, _id] = Node.from_global_id(args["id"])
      case type do
        "trip" ->
          Backend.retrieve(%{"query" => "Trip"}, args, context)
        _ ->
          Backend.retrieve(item, args, context)
      end
    end)
  end

  def connection_fields(type) do
    %{
      count: %{
        type: %Type.Int{},
        resolve: fn(connection, _args, _info) ->
          Enum.count(connection.edges)
        end
      },
      nodes: %{
        type: %Type.List{ofType: type},
        resolve: fn(connection, _args, _info) ->
          connection.edges
          |> Enum.map(fn(edge) -> edge.node end)
        end
      }
    }
  end
end