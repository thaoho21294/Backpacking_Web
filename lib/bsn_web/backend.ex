defmodule BsnWeb.Backend do
  alias Neo4j.Sips, as: Neo4j

  def get(%{"query" => "Trips"}, %{id: id}, context) do
    cypher="""
    MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{id} return id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
    """
    Enum.at(Neo4j.query!(Neo4j.conn, cypher),0)
  end

  def get(%{"id" => trip_id} = _trip, _args, _context) do
    cypher="""
    MATCH (l:Location)<-[:LOCATE]-(s:Stop)<-[:INCLUDE]-(t:Trip)
    WHERE id(t)=#{trip_id}
    OPTIONAL MATCH (l:Location)<-[:LOCATE]-(s:Stop)-[:THROUGH]->(r:Route)-[:MODE]->(v:Vehicle), (s:Stop)<-[:INCLUDE]-(t:Trip)
    WHERE id(t)=#{trip_id}
    return id(s) as id, s.name as name,s.description as description, l.lat as lat, l.long as lng, l.address as address, v.name as mode, s.order as order,
    s.arrive as arrive, s.departure as departure, r.name as route_name, r.duration as route_duration, r.distance as route_distance
    ORDER BY order
    """

    Neo4j.query!(Neo4j.conn, cypher)
  end
end