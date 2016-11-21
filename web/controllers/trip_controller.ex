defmodule BsnWeb.TripController do
  use BsnWeb.Web, :controller
  alias Neo4j.Sips, as: Neo4j

    def get_all_stops(conn, %{"id"=>tripid}) do
      cypher="""
      MATCH (l:Location)<-[:LOCATE]-(s:Stop)<-[:INCLUDE]-(t:Trip)
      WHERE id(t)=#{tripid}
      OPTIONAL MATCH (l:Location)<-[:LOCATE]-(s:Stop)-[:THROUGH]->(r:Route)-[:MODE]->(v:Vehicle), (s:Stop)<-[:INCLUDE]-(t:Trip)
      WHERE id(t)=#{tripid}
      return s.name as name,s.description as description, l.lat as lat, l.long as lng, l.address as address, v.name as mode, s.order as order,
      s.arrive as arrive, s.departure as departure, r.name as route_name, r.duration as route_duration, r.distance as route_distance
      ORDER BY order
      """
      stops=Neo4j.query!(Neo4j.conn, cypher)
      render(conn, "get_all_stops.json", stops: stops)
    end
    def get_trip_detail(conn, %{"id"=>tripid})do
      cypher="""
      MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{tripid} return t.name as name, t.off_time as off_time, t.note as note,
       t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
       t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
      """
      tripdetail= Enum.at(Neo4j.query!(Neo4j.conn, cypher),0)
	  render(conn, "get_trip_detail.json", tripdetail: tripdetail)
    end
    def get_members(conn, %{"id"=>tripid}) do
      cypher="MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER]->(t:Trip) where id(t)=#{tripid} return p.nick_name"
      members=Neo4j.query!(Neo4j.conn, cypher)
      render(conn, "get_members.json", members: members)
    end
    def add_stop(conn, %{"name"=>name, "address"=>address, "arrive"=>arrive,"departure"=>departure, "order"=>order,"lat"=>lat, "lng"=>lng, "description"=>description, "tripid"=>tripid,"route_name"=>route_name, "route_duration"=>route_duration, "route_distance"=>route_distance, "route_mode"=>route_mode}) do
      cypher_get_location="MATCH (l:Location{address:\"#{address}\"}) return id(l) as id"
      locations= Neo4j.query!(Neo4j.conn, cypher_get_location);
      cypher=
      case route_name do
        ""->
          case Enum.empty?(locations)do
            true->"""
            MATCH (t:Trip)
            WHERE id(t)=#{tripid}
            CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
            CREATE (l:Location{address:\"#{address}\", lat:#{lat}, long:#{lng} })
            CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l)
            """
            false->"""
            MATCH (t:Trip), (l:Location{address:\"#{address}\"})
            WHERE id(t)=#{tripid}
            CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
            CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l)
            """
          end
        _->
          case Enum.empty?(locations)do
            true->"""
              MATCH (t:Trip), (m:Vehicle{name:\"#{route_mode}\"})
              WHERE id(t)=#{tripid}
              CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
              CREATE (l:Location{address:\"#{address}\", lat:#{lat}, long:#{lng} })
              CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration},distance: #{route_distance}})
              CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l), (s)-[:THROUGH]->(r)-[:MODE]->(m)
              """
            false->"""
                MATCH (t:Trip), (l:Location{address:\"#{address}\"}),(m:Vehicle{name:\"#{route_mode}\"})
                WHERE id(t)=#{tripid}
                CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description:\"#{description}\",  order: #{order}})
                CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration},distance: #{route_distance}})
                CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l), (s)-[:THROUGH]->(r)-[:MODE]->(m)
                """
          end 
      end
      response=Neo4j.query!(Neo4j.conn, cypher)
      json conn, response
    end
    def edit_route(conn, %{"name"=>name, "duration"=>duration, "distance"=>distance, "stop_order"=>stop_order, "tripid"=>tripid}) do
      cypher= """
      MATCH (t:Trip)-[:INCLUDE]->(s:Stop{order=#{stop_order})-[:THROUGH]->(r:Route)
      WHERE id(t)=#{tripid}
      SET r.name=\"#{name}\", r.duration=#{duration}, r.distance=#{distance}
      """
      response=Neo4j.query!(Neo4j.conn, cypher)
      json conn, response
    end
    def add_stop_update_order(conn, %{"tripid"=>tripid, "new_stop_order"=>new_stop_order}) do
      cypher="MATCH (t:Trip)-[INCLUDE]->(s:Stop) WHERE id(t)=#{tripid} and s.order>=#{new_stop_order} SET s.order=s.order+1"
      response=Neo4j.query!(Neo4j.conn, cypher)
      json conn, response
    end
    # def add_stop(conn, _params) do
    #   cypher="CREATE (s:Stop{name: "+_params.name+", arrive:"+_params.arrive+", departure:"+_params.departure+", order: "+_params.order+"})"
    #   response=Neo4j.query!(Neo4j.conn, cypher)
    #   json conn,response
    # end
end
