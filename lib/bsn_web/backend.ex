defmodule BsnWeb.Backend do
  @moduledoc """
  The backend interface for retrieving data.

  Provides the callbacks for basic CRUD oprations:
  - `create/2`
  - `retrieve/3`
  - `update/?`
  - `delete/?`

  This is where we make the calls to database. The internal details are
  abstracted and should not be of concern.
  """
  alias Neo4j.Sips
  alias __MODULE__

  @doc """
  Callback for creating resource.
  """
  def create(input, _context) do
    # @TODO: Create trip with a user as owner.
    query = """
    CREATE (t:Trip{name:\"#{input["name"]}\", description:\"#{input["description"]}\"})
    RETURN t
    """
    
    [row] = Sips.query!(Sips.conn, query)
    row["t"]
  end

  @doc """
  Callback for retrieving resource.

  The first argument is the parent of the resource in the query. For
  example, querying for all the trips is done on the `viewer` object,
  thus the first argument will be the viewer. This allows filtering
  which trips the viewer can retrieve.

  The second argument is a map of arguments for the query. It has a 
  `:type` key to indicate the resource type.

  The third argument is the GraphQL context in case we need to look at
  the schema and operations.
  """
  def retrieve(_source, %{type: "Trip", id: id}, _context) do
    cypher="""
    MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{id} return id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
    """

    Enum.at(Sips.query!(Sips.conn, cypher),0)
  end

  def retrieve(viewer, %{type: "Trip"} = args, context) do
    cypher="""
    MATCH (t:Trip) 
    RETURN id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost
    LIMIT 25
    """

    Sips.query!(Sips.conn, cypher)
  end

  def retrieve(%{"id" => trip_id} = _trip, %{type: "Stop"}, _context) do
    cypher="""
    MATCH (l:Location)<-[:LOCATE]-(s:Stop)<-[:INCLUDE]-(t:Trip)
    WHERE id(t)=#{trip_id}
    OPTIONAL MATCH (l:Location)<-[:LOCATE]-(s:Stop)-[:THROUGH]->(r:Route)-[:MODE]->(v:Vehicle), (s:Stop)<-[:INCLUDE]-(t:Trip)
    WHERE id(t)=#{trip_id}
    return id(s) as id, s.name as name,s.description as description, l.lat as lat, l.long as lng, l.address as address, v.name as mode, s.order as order,
    s.arrive as arrive, s.departure as departure, r.name as route_name, r.duration as route_duration, r.distance as route_distance
    ORDER BY order
    """

    Sips.query!(Sips.conn, cypher)
  end

  # Callbacks for being a Plug used in Router.
  @behaviour Plug
  def init(opts) do
    Keyword.merge([schema: {Backend.Schema, :root}], opts)
    |> GraphQL.Plug.init()
  end

  def call(conn, opts) do
    GraphQL.Plug.call(conn, opts)
  end
end