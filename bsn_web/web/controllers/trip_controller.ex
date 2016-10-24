defmodule BsnWeb.TripController do
  use BsnWeb.Web, :controller

    alias Neo4j.Sips, as: Neo4j

    # def get_trip_data(conn, %{"tripid"=>id}) do
    #   #send many data
    #   routes= get_routes(id).routes
    #   tripdetail=get_trip_detail(id).tripdetail
    #   members=get_members(id).members
    #   data=%{}
    #   data=Map.puts(data, "routes",routes)
    #   data=Map.puts(data, "tripdetail",tripdetail)
    #   data=Map.puts(data, "members",members)
    #   render(conn, "get_trip_data.json", data: data)
    # end
    def get_routes(conn, %{"tripid"=>tripid}) do
      cypher="""
      MATCH (t:Trip)-[:INCLUDE|START|END]->(r:Route)-[:MODE]->(v:Vehicle)
       WHERE id(t)=#{tripid} return id(r) as id, r.name as name,
        r.distance as distance, r.duration as duration, v.name as mode
        """
      routes= Neo4j.query!(Neo4j.conn,cypher)
      routes=Enum.reduce(routes,[], fn (x,result)->
          routeid=Map.get(x,"id")
          stops=get_stops_route(routeid).stops
          x=Map.put(x,"start",Enum.at(stops,0))
          x=Map.put(x,"end",Enum.at(stops,1))
          result=result++[x]
        end)
       render(conn,"get_routes.json", routes: routes)
    end
    def get_stops_route(routeid) do
      cypher="""
      MATCH (r:Route)-[be]->(s:Stop)-[:HAVE]->(l:Location)
      where id(r)=#{routeid} return s.name as name, s.arrive as arrive, s.departure as departure, l.lat as lat, l.long as long
      """
      stops=Neo4j.query!(Neo4j.conn, cypher)
      %{stops: stops}
    end
    def get_trip_detail(conn, %{"tripid"=>tripid})do
      cypher="""
      MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{tripid} return t.name as name, t.off_time as off_time, t.note as note,
       t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
       t.description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
      """
      tripdetail= Neo4j.query!(Neo4j.conn, cypher)
      render(conn, "get_trip_detail.json", tripdetail: tripdetail)
    end
    def get_members(conn, %{"tripid"=>tripid}) do
      cypher="MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER]->(t:Trip) where id(t)=#{tripid} return p.nick_name"
      members=Neo4j.query!(Neo4j.conn, cypher)
      render(conn, "get_members.json", members: members)
    end
end
