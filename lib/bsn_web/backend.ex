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

  def create(input, _context) do
    # @TODO: Create trip with a user as owner.
    query = """
    CREATE (t:Trip{name:\"#{input["name"]}\", description:\"#{input["description"]}\"})
    RETURN t
    """
    
    [row] = Sips.query!(Sips.conn, query)
    row["t"]
  end

  def retrieve(%{"query" => "Trips"}, %{id: id}, _context) do
    cypher="""
    MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{id} return id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
    """

    Enum.at(Sips.query!(Sips.conn, cypher),0)
  end

  def retrieve(%{"id" => trip_id} = _trip, _args, _context) do
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