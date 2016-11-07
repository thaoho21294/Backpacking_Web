defmodule BsnWeb.TripController do
  use BsnWeb.Web, :controller
  alias Neo4j.Sips, as: Neo4j

    def get_all_stops(conn, %{"tripid"=>tripid}) do
      cypher="""
      MATCH (l:Location)<-[:LOCATE]-(s:Stop)<-[:INCLUDE]-(t:Trip)
      OPTIONAL MATCH (l:Location)<-[:LOCATE]-(s:Stop)-[:THROUGH]->(r:Route)-[:MODE]->(v:Vehicle), (s:Stop)<-[:INCLUDE]-(t:Trip)
      WHERE id(t)=#{tripid}
      return s.name as name,s.description as description, l.lat as lat, l.long as lng, l.address as address, v.name as mode, s.order,
      s.arrive as arrive, s.departure as departure, r.name as route_name, r.duration as route_duration, r.distance as route_distance
      ORDER BY s.order
      """
      stops=Neo4j.query!(Neo4j.conn, cypher)
      render(conn, "get_all_stops.json", stops: stops)
    end
    def get_trip_detail(conn, %{"tripid"=>tripid})do
      cypher="""
      MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{tripid} return t.name as name, t.off_time as off_time, t.note as note,
       t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
       t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
      """
      tripdetail= Enum.at(Neo4j.query!(Neo4j.conn, cypher),0)
	  render(conn, "get_trip_detail.json", tripdetail: tripdetail)
    end
    def get_members(conn, %{"tripid"=>tripid}) do
      cypher="MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER]->(t:Trip) where id(t)=#{tripid} return p.nick_name"
      members=Neo4j.query!(Neo4j.conn, cypher)
      render(conn, "get_members.json", members: members)
    end
end
