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

  # Gets a single trip.
  def retrieve(_source, %{type: "Trip", id: id}, _context) do
    cypher = """
    MATCH (t:Trip)-[:HAVE]->(s:Status) where id(t)=#{id} return t.name as name, t.off_time as off_time, t.note as note,
       t.start_date as start_date, t.end_date as end_date, t.estimated_number_of_members as estimated_members,
       t.description as description, t.estimate_cost as estimated_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status,
      t.necessary_tool as necessary_tool, t.cost_detail as cost_detail
    """

    Enum.at(Sips.query!(Sips.conn, cypher),0)
  end

  # Get list of trips
  def retrieve(viewer, %{type: "Trip"} = args, context) do
    cypher = """
    MATCH (t:Trip) 
    RETURN id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost
    LIMIT 25
    """

    Sips.query!(Sips.conn, cypher)
  end

  # Get a trip's stops.
  def retrieve(%{"id" => trip_id} = _trip, %{type: "Stop"}, _context) do
    cypher = """
    MATCH (l:Location)<-[:LOCATE]-(s:Stop)<-[:INCLUDE]-(t:Trip)
      WHERE id(t)=#{trip_id}
      OPTIONAL MATCH (l:Location)<-[:LOCATE]-(s:Stop)-[:THROUGH]->(r:Route)-[:MODE]->(v:Vehicle), (s:Stop)<-[:INCLUDE]-(t:Trip)
      WHERE id(t)=#{trip_id}
      return s.name as name,s.description as description, l.lat as lat, l.long as lng, l.address as address, v.name as mode, s.order as order,
      s.arrive as arrive, s.departure as departure, r.name as route_name, r.duration as route_duration, r.distance as route_distance, r.description as route_description 
      ORDER BY order
    """

    Sips.query!(Sips.conn, cypher)
  end
  #get trip's routes with polyline
  def retrieve(%{"id" => trip_id} = _trip, %{type: "Route"}, _context) do
    cypher = """
    MATCH (trip:Trip)-[:INCLUDE]->(stop2:Stop)-[:THROUGH]->(r:Route), 
          (trip:Trip)-[:INCLUDE]->(stop1:Stop)-[:LOCATE]->(origin:Location), 
          (stop2:Stop)-[:LOCATE]->(destination:Location)
    WHERE id(trip)=#{trip_id} and stop1.order=stop2.order-1
    RETURN r.polyline as polyline, origin.lat as start_lat, origin.long as start_lng, destination.lat as end_lat, destination.long as end_lng
    """

    Sips.query!(Sips.conn, cypher)
  end
  #get trip's member
  def retrieve(%{id: trip_id}, %{type: "Member"}, _context) do
    cypher="""
    MATCH (p:Profile)<-[:HAVE]-(u:User)-[m:MEMBER]->(t:Trip) 
    where id(t)=#{trip_id} 
    return p.first_name +" "+ p.last_name as name, p.hometown as hometown, m.joined_date as joined_date, m.lat as lat, m.lng as lng, m.role as role
    """
     Sips.query!(Sips.conn, cypher)
  end
  #update members Location
  def retrieve(%{id: trip_id}, %{type: "MemberLocation", user_id: user_id, lat: lat, lng: lng}, _context) do
    cypher="""
    MATCH (u:User)-[m:MEMBER]->(t:Trip) 
    WHERE id(t)=#{trip_id} and id(u)=#{user_id}
    SET m.lat=#{lat}, m.lng=#{lng}
    """
  end
  #Add a stop to trip
  def retrieve(%{id: trip_id} = _trip, %{type: "AddStop", name: name, address: address, arrive: arrive, departure: departure, order: order, lat: lat, lng: lng, description: description, route_name: route_name, route_duration: route_duration, route_distance: route_distance, route_mode: route_mode}, _context) do
    locations= retrieve(%{type: "locations", address: address})
     cypher=
    case route_name do
      ""->
        case Enum.empty?(locations)do
          true->"""
          MATCH (t:Trip)
          WHERE id(t)=#{trip_id}
          CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
          CREATE (l:Location{address:\"#{address}\", lat:#{lat}, long:#{lng} })
          CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l)
          """
          false->"""
          MATCH (t:Trip), (l:Location{address:\"#{address}\"})
          WHERE id(t)=#{trip_id}
          CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
          CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l)
          """
        end
      _->
        case Enum.empty?(locations)do
          true->"""
            MATCH (t:Trip), (m:Vehicle{name:\"#{route_mode}\"})
            WHERE id(t)=#{trip_id}
            CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
            CREATE (l:Location{address:\"#{address}\", lat:#{lat}, long:#{lng} })
            CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration},distance: #{route_distance}})
            CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l), (s)-[:THROUGH]->(r)-[:MODE]->(m)
            """
          false->"""
              MATCH (t:Trip), (l:Location{address:\"#{address}\"}),(m:Vehicle{name:\"#{route_mode}\"})
              WHERE id(t)=#{trip_id}
              CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description:\"#{description}\",  order: #{order}})
              CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration},distance: #{route_distance}})
              CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l), (s)-[:THROUGH]->(r)-[:MODE]->(m)
              """
        end 
    end
    Sips.query!(Sips.conn, cypher)
  end
  #get all location
  def retrieve(%{type: "locations", address: address}) do
    cypher="MATCH (l:Location{address:\"#{address}\"}) return id(l) as id"
    Sips.query!(Sips.conn, cypher);
  end
  def retrieve(%{id: trip_id}, %{type: "EditRoute",name: name, duration: duration, distance: distance, stop_order: stop_order}) do
      cypher= """
    MATCH (t:Trip)-[:INCLUDE]->(s:Stop{order=#{stop_order})-[:THROUGH]->(r:Route)
    WHERE id(t)=#{trip_id}
    SET r.name=\"#{name}\", r.duration=#{duration}, r.distance=#{distance}
    """
    Sips.query!(Sips.conn, cypher)
  end
    def retrieve(%{id: trip_id}, %{new_stop_order: new_stop_order}) do
    cypher="MATCH (t:Trip)-[INCLUDE]->(s:Stop) WHERE id(t)=#{trip_id} and s.order>=#{new_stop_order} SET s.order=s.order+1"
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{holder_id: holder_id}, %{start_address: start_address,start_lat: start_lat, start_lng: start_lng, end_address: end_address,end_lat: end_lat, end_lng: end_lng, trip_name: trip_name, start_date: start_date, end_date: end_date, estimated_cost: estimated_cost, estimated_members: estimated_members, mode: mode, route_name: route_name, route_duration: route_duration, route_distance: route_distance}) do
      
      start_lat=String.to_float(start_lat)
      start_lng=String.to_float(start_lng)
      end_lat=String.to_float(end_lat)
      end_lng=String.to_float(end_lng)

      start_stop_name=String.split(start_address, ~r{,})
      start_stop_name=Enum.at(start_stop_name, Enum.count(start_stop_name)-2)
      end_stop_name=String.split(end_address, ~r{,})
      end_stop_name=Enum.at(end_stop_name, Enum.count(end_stop_name)-2)

      end_date=String.to_integer(end_date)
      estimated_members= String.to_integer(estimated_members)
      estimated_cost=String.to_integer(estimated_cost)
      holder_id=String.to_integer(holder_id)

      start_arrive= String.to_integer(start_date)
      route_duration=String.to_integer(route_duration)
      route_distance=String.to_integer(route_distance)
      start_departure= start_arrive+3600000
      end_arrive=start_departure+route_duration*60000
      end_departure=end_arrive+3600000

      created_date=1470567600000
        
      cypher= """
      MATCH (s:Status{name:'open'}),(u:User),(m:Vehicle{name:\"#{mode}\"})
      WHERE id(u)=#{holder_id} 
      CREATE (l1:Location{address: \"#{start_address}\", lat: #{start_lat}, long:#{start_lng}}) 
      CREATE (l2:Location{address: \"#{end_address}\", lat: #{end_lat}, long:#{end_lng}}) 
      CREATE (t:Trip{name:\"#{trip_name}\",start_date:#{start_date}, end_date:#{end_date}, estimated_cost:#{estimated_cost}, estimated_number_of_members:#{estimated_members}, created_date:#{created_date}}) 
      CREATE (s1:Stop{name:\"#{start_stop_name}\", arrive:#{start_arrive}, departure:#{start_departure}, order:1}) 
      CREATE (s2:Stop{name:\"#{end_stop_name}\", arrive:#{end_arrive}, departure:#{end_departure}, order:2}) 
      CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration}, distance:#{route_distance}}) 
      CREATE (u)-[:MEMBER {role:"holder",joined_date:#{created_date}}]->(t)-[:HAVE]->(s), (l1)<-[:LOCATE]-(s1)<-[:INCLUDE]-(t)-[:INCLUDE]->(s2)-[:LOCATE]->(l2), (s2)-[:THROUGH]->(r)-[:MODE]->(m) 
      return id(t) as trip_id
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