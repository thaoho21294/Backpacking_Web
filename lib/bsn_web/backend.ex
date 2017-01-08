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
       t.description as description, t.estimated_cost as estimated_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status,
      t.necessary_tool as necessary_tool, t.cost_detail as cost_detail, t.background as background
    """

    Enum.at(Sips.query!(Sips.conn, cypher),0)
  end

  # Get list of trips
  def retrieve(viewer, %{type: "Trip"} = args, context) do
    cypher = """
    MATCH (t:Trip) 
    RETURN id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.startdate as startdate, t.enddate as enddate, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, t.background as background 
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
      return id(s) as id, s.name as name,s.description as description, l.lat as lat, l.long as lng, l.address as address, v.name as mode, s.order as order,
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
    return id(m) as id, p.first_name +" "+ p.last_name as full_name, p.hometown as hometown, m.joined_date as joined_date, m.lat as lat, m.lng as lng, m.role as role, p.avatar as avatar 
    """
     Sips.query!(Sips.conn, cypher)
  end
  #update members Location
  def retrieve(%{type: "MemberLocation", member_id: member_id, lat: lat, lng: lng}, _context) do
    cypher="""
    MATCH (u:User)-[m:MEMBER]->(t:Trip) 
    WHERE id(m)=#{member_id}
    SET m.lat=#{lat}, m.lng=#{lng}
    """
  end
  #Add a stop to trip
  def retrieve(%{id: trip_id} = _trip, %{type: "AddStop", name: name, address: address, arrive: arrive, departure: departure, order: order, lat: lat, lng: lng, description: description, route_name: route_name, route_duration: route_duration, route_distance: route_distance, route_mode: route_mode, route_polyline: route_polyline}, _context) do
    locations= retrieve(%{type: "locations", address: address})
    if(Enum.empty?(locations)) do
      retrieve(%{type: "create_location", address: address, lat: lat, lng: lng})
    end
    cypher="
          MATCH (t:Trip), (l:Location{address:\"#{address}\"}), (m:Vehicle{name:\"xe máy\"})
          WHERE id(t)=#{trip_id}
          CREATE (s:Stop{name:\"#{name}\", arrive:#{arrive}, departure:#{departure}, description: \"#{description}\", order: #{order}})
          CREATE (t)-[:INCLUDE]->(s)-[:LOCATE]->(l)
          "
    if route_name!="" do
      route_polyline=String.replace(route_polyline, "\\", "\\\\");
      cypher=cypher <> "
              CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration}, distance: #{route_distance}, polyline:\"#{route_polyline}\"})
              CREATE (s)-[:THROUGH]->(r)-[:MODE]->(m) "
      end
    Sips.query!(Sips.conn, cypher)
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
  def retrieve(%{holder_id: holder_id}, %{type: "TripNew", start_address: start_address,start_lat: start_lat, start_lng: start_lng, end_address: end_address,end_lat: end_lat, end_lng: end_lng, trip_name: trip_name, start_date: start_date, end_date: end_date, estimated_cost: estimated_cost, estimated_members: estimated_members, mode: mode, route_name: route_name, route_duration: route_duration, route_distance: route_distance, route_polyline: route_polyline}) do
      
      
      start_lat=String.to_float(start_lat)
      start_lng=String.to_float(start_lng)
      end_lat=String.to_float(end_lat)
      end_lng=String.to_float(end_lng)

      start_stop_name=String.split(start_address, ~r{,})
      start_stop_name=Enum.at(start_stop_name, Enum.count(start_stop_name)-2)
      end_stop_name=String.split(end_address, ~r{,})
      end_stop_name=Enum.at(end_stop_name, Enum.count(end_stop_name)-2)

      end_date=String.to_integer(end_date)
      if estimated_cost=="" do estimated_cost='0' end
      if  estimated_members=="" do estimated_members='0' end
      estimated_members= String.to_integer(estimated_members)
      estimated_cost=String.to_integer(estimated_cost)
      holder_id=String.to_integer(holder_id)

      start_arrive= String.to_integer(start_date)
      route_duration=String.to_integer(route_duration)
      route_distance=String.to_integer(route_distance)
      start_departure= start_arrive+3600000
      end_arrive=start_departure+route_duration*60000
      end_departure=end_arrive+3600000
      off_time=start_date
      created_date=1470567600000
      background="/images/trip_backgrounds/trip196.jpg"


      start_locations= retrieve(%{type: "locations", address: start_address})
      if Enum.empty?(start_locations) do
        retrieve(%{type: "create_location", address: start_address, lat: start_lat, lng: start_lng})
      end
      end_locations= retrieve(%{type: "locations", address: end_address})
      if Enum.empty?(end_locations) do
        retrieve(%{type: "create_location", address: end_address,lat: end_lat,lng: end_lng})
      end
      route_polyline=String.replace(route_polyline, "\\", "\\\\");
      cypher= """
      MATCH (s:Status{name:'open'}),(u:User),(m:Vehicle{name:\"#{mode}\"}), (l1:Location{address: \"#{start_address}\"}), (l2:Location{address: \"#{end_address}\"}) 
      WHERE id(u)=#{holder_id} 
      CREATE (t:Trip{name:\"#{trip_name}\",start_date:#{start_date}, end_date:#{end_date}, estimated_cost:#{estimated_cost}, estimated_number_of_members:#{estimated_members}, created_date:#{created_date}, off_time:#{off_time}, background:\"#{background}\"}) 
      CREATE (s1:Stop{name:\"#{start_stop_name}\", arrive:#{start_arrive}, departure:#{start_departure}, order:1}) 
      CREATE (s2:Stop{name:\"#{end_stop_name}\", arrive:#{end_arrive}, departure:#{end_departure}, order:2}) 
      CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration}, distance:#{route_distance}, polyline: \"#{route_polyline}\"}) 
      CREATE (u)-[:MEMBER {role:"leader",joined_date:#{created_date}}]->(t)-[:HAVE]->(s), (l1)<-[:LOCATE]-(s1)<-[:INCLUDE]-(t)-[:INCLUDE]->(s2)-[:LOCATE]->(l2), (s2)-[:THROUGH]->(r)-[:MODE]->(m) 
      return id(t) as trip_id
     """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{id: trip_id}, %{type: "UpdateTripDetail", trip_name: trip_name, start_date: start_date, end_date: end_date, description: description, estimated_cost: estimated_cost, estimated_members: estimated_members, cost_detail: cost_detail, off_time: off_time, off_place: off_place, necessary_tool: necessary_tool, note: note}, _context) do
    cypher="""
    MATCH (t:Trip)
    WHERE id(t)=#{trip_id}
    SET t.trip_name=\"#{trip_name}\", t.start_date=#{start_date}, t.end_date=#{end_date}, t.description=\"#{description}\", t.estimated_cost=#{estimated_cost}, 
    t.estimated_number_of_members= #{estimated_members}, t.cost_detail=\"#{cost_detail}\", t.off_time= #{off_time}, t.off_place= \"#{off_place}\",
    t.necessary_tool= \"#{necessary_tool}\", t.note=\"#{note}\"
    """
    # IO.inspect(cypher);
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{id: stop_id}, %{type: "UpdateRoute", route_duration: route_duration, route_description: route_description}, _context) do
    cypher="""
    MATCH (s:Stop)-[:THROUGH]->(r:Route)
    WHERE id(s)=#{stop_id}
    SET r.duration= #{route_duration}, r.description=\"#{route_description}\"
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{id: stop_id},%{type: "UpdateStop", name: name, arrive: arrive, departure: departure, description: description, address: address, lat: lat, lng: lng}, _context) do
    stop_address=Map.get(Enum.at(retrieve(%{type: "location_stop", id: stop_id}),0), "address")
    remove_relationship_stop_location="""
    MATCH (s:Stop)-[lt:LOCATE]->(l:Location)
    WHERE id(s)=#{stop_id} 
    DELETE lt
    """
    create_relationship_stop_location="""
    MATCH (s:Stop), (l:Location{address:\"#{address}\"})
    WHERE id(s)=#{stop_id}
    CREATE (s)-[:LOCATE]->(l)
    """
    IO.inspect(stop_address);
    if stop_address!=address do
      #remove relationship
      Sips.query!(Sips.conn, remove_relationship_stop_location)
      #check location if exited
      locations= retrieve(%{type: "locations", address: address})
      if(Enum.empty?(locations)) do
        retrieve(%{type: "create_location", address: address, lat: lat, lng: lng})
      end
    end
    Sips.query!(Sips.conn, create_relationship_stop_location)
    cypher="""
    MATCH (s:Stop)
    WHERE id(s)=#{stop_id}
    SET s.name=\"#{name}\", s.arrive=#{arrive}, s.departure=#{departure}, s.description=\"#{description}\"
    """
    Sips.query!(Sips.conn, cypher)
  end
#--------------------------------------------------
# internal functions
#-------------------------------------------------
  #get all location
  def retrieve(%{type: "locations", address: address}) do
    cypher="MATCH (l:Location{address:\"#{address}\"}) return id(l) as id"
    Sips.query!(Sips.conn, cypher);
  end
  #get address stop
  def retrieve(%{type: "location_stop", id: stop_id}) do
    cypher= """
    MATCH (s:Stop)-[:LOCATE]->(l:Location)
    WHERE id(s)=#{stop_id}
    RETURN l.address as address
    """
    Sips.query!(Sips.conn, cypher)
  end
  #create location
  def retrieve(%{type: "create_location", address: address, lat: lat,lng: lng}) do
    cypher="CREATE (l:Location{address: \"#{address}\", lat: #{lat}, long: #{lng}})"
    Sips.query!(Sips.conn, cypher)
  end
#-----------------------------------------
  def retrieve(%{id: stop_id},%{ type: "UpdateArriveDepartureStop", arrive: arrive, departure: departure}, _context) do
    cypher= """
    MATCH (s:Stop)
    WHERE id(s)=#{stop_id}
    SET s.arrive=#{arrive}, s.departure=#{departure}
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{id: trip_id}, %{type: "UpdateTripStartDate", start_date: start_date}) do
    cypher= "MATCH (t:Trip) WHERE id(t)=#{trip_id} SET t.start_date=#{start_date}"
    Sips.query!(Sips.conn, cypher)
  end
    def retrieve(%{id: trip_id}, %{type: "UpdateTripEndDate", end_date: end_date}) do
    cypher= "MATCH (t:Trip) WHERE id(t)=#{trip_id} SET t.end_date=#{end_date}"
    Sips.query!(Sips.conn, cypher)
    end
    def retrieve(%{id: user_id}, %{type: "ViewTripsList"})do
      cypher="""
      MATCH (t:Trip)-[:HAVE]->(s:Status) 
      WHERE s.name=\"open\" 
      RETURN id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date 
      ORDER BY t.created_date DESC
      """
      Sips.query!(Sips.conn, cypher)
    end
    def retrieve(%{type: "FindTrip", location: location, start_date: start_date, end_date: end_date}) do
      cypher="""
      MATCH (t:Trip)-[:INCLUDE]->(s:Stop)-[:LOCATE]->(l:Location)
      WHERE t.start_date>=#{start_date} and t.end_date<=#{end_date} and l.address=~'.*#{location}.*'
      RETURN DISTINCT id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date 
      ORDER BY t.created_date DESC
      """
      Sips.query!(Sips.conn, cypher)
    end
    def retrieve(%{type: "CreateUser", email: email, password: password, first_name: first_name, last_name: last_name }) do
      cypher=""
       Sips.query!(Sips.conn, cypher)
    end
    def retrieve(%{type: "FindUser", email: email}) do
      IO.inspect(email)
      cypher="MATCH (u:User) WHERE u.email=\"#{email}\" return id(u) as id, u.pass as password"
      Sips.query!(Sips.conn, cypher)
    end
    def retrieve(%{type: "CheckUser", email: email, password: password}) do
      cypher="MATCH (u:User) WHERE u.email=\"#{email}\" and u.pass=\"#{password}\" return id(u) as id"
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