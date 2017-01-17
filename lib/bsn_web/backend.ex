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

  @jwt_secret Application.get_env(:bsn_web, :jwt_secret)

  @doc """
  Callback for creating resource.
  """
  def create(%{type: "User", email: email, password: password, first_name: first_name, last_name: last_name, hometown: hometown, living_address: living_address, living_lat: living_lat, living_lng: living_lng, gender: gender}, _context) do
    created_date = DateTime.to_unix(DateTime.utc_now()) * 1000
    address= living_address
    lat=living_lat
    lng=living_lng
    locations= retrieve(%{type: "locations", address: address})
    if(Enum.empty?(locations)) do
      retrieve(%{type: "create_location", address: address, lat: lat, lng: lng})
    end
    cypher = """
    MATCH (l:Location{address: "#{address}"})
    CREATE (u:User{email: "#{email}", pass: "#{password}", created_date: #{created_date}})
    CREATE (p:Profile {first_name: "#{first_name}", last_name:"#{last_name}", hometown: "#{hometown}", gender:"#{gender}", avatar: "/images/avatar_white.png"})
    CREATE (u)-[:HAVE]->(p)-[:LIVE]->(l)
    RETURN id(u) as id
    """
    Map.get(Enum.at(Sips.query!(Sips.conn, cypher), 0), "id")
  end

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

  # Get the current trip of the authenticated viewer, if any.
  def retrieve(_source, %{type: "Trip", id: "current"}, %{root_value: %{user: nil}}) do
    nil
  end
  def retrieve(_source, %{type: "Trip", id: "current"}, %{root_value: %{user: user}}) do
    cypher = """
    MATCH (u:User)-[:MEMBER]->(t:Trip)-[:HAVE]->(s:Status)
    WHERE s.name=\"happen\" and id(u)=#{user["id"]}
    RETURN id(t) as id, t.name as name, t.off_time as off_time, t.note as note,
     t.start_date as start_date, t.end_date as end_date, t.estimated_number_of_members as estimated_number_of_members,
     t.description as description, t.estimate_cost as estimate_cost, t.off_place as off_place, t.real_cost as real_cost, s.name as status
    """
    #t.start_date <= timestamp() and t.end_date > timestamp()
    Enum.at(Sips.query!(Sips.conn, cypher),0)
  end

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
          MATCH (t:Trip), (l:Location{address:\"#{address}\"}), (m:Vehicle{name:\"#{route_mode}\"})
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
      created_date= DateTime.to_unix(DateTime.utc_now())*1000
      IO.inspect(created_date)
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
      CREATE (t:Trip{name:\"#{trip_name}\",start_date:#{start_date}, end_date:#{end_date}, estimated_cost:#{estimated_cost}, estimated_number_of_members:#{estimated_members},vehicle: "#{mode}", created_date:#{created_date}, off_time:#{off_time}, background:\"#{background}\"}) 
      CREATE (s1:Stop{name:\"#{start_stop_name}\", arrive:#{start_arrive}, departure:#{start_departure}, order:1}) 
      CREATE (s2:Stop{name:\"#{end_stop_name}\", arrive:#{end_arrive}, departure:#{end_departure}, order:2}) 
      CREATE (r:Route{name:\"#{route_name}\", duration:#{route_duration}, distance:#{route_distance}, polyline: \"#{route_polyline}\"}) 
      CREATE (u)-[:MEMBER {role:"leader",joined_date:#{created_date}}]->(t)-[:HAVE]->(s), (l1)<-[:LOCATE]-(s1)<-[:INCLUDE]-(t)-[:INCLUDE]->(s2)-[:LOCATE]->(l2), (s2)-[:THROUGH]->(r)-[:MODE]->(m) 
      return id(t) as trip_id
     """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{id: trip_id}, %{type: "UpdateTripDetail", trip_name: trip_name, start_date: start_date, end_date: end_date, description: description, estimated_cost: estimated_cost, estimated_members: estimated_members, cost_detail: cost_detail, off_time: off_time, off_place: off_place, necessary_tool: necessary_tool, note: note}, _context) do
    description=String.replace(description, "\\", "\\\\")
    description=String.replace(description, "\"", "\\\"")
    cost_detail=String.replace(cost_detail, "\\", "\\\\")
    cost_detail=String.replace(cost_detail, "\"", "\\\"")
    necessary_tool=String.replace(necessary_tool, "\\", "\\\\")
    necessary_tool=String.replace(necessary_tool, "\"", "\\\"")
    note=String.replace(note, "\\", "\\\\")
    note=String.replace(note, "\"", "\\\"")
    off_place=String.replace(off_place, "\\", "\\\\")
    IO.inspect("--------------------------------------------------------------");
    IO.inspect(description);
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

  def retrieve(viewer, %{type: "Route"}, _context) do
    cypher = """
    MATCH (stop1:Stop)-[:THROUGH]->(r:Route), 
          (stop1:Stop)-[:LOCATE]->(origin:Location {address: "Khu du lịch Madagui, Lâm Đồng, Việt Nam"}), 
          (stop2:Stop)-[:LOCATE]->(destination:Location {address: "Nice Dream Hotel, Dalat, Lâm Đồng, Vietnam"})
    RETURN r
    """

    routes = Sips.query!(Sips.conn, cypher)
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
    MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER{role: \"leader\"}]->(t:Trip)-[:HAVE]->(s:Status), (t:Trip)-[:INCLUDE]->(st:Stop)-[:LOCATE]->(sl:Location), (uu:User)-[:HAVE]->(pp:Profile)-[:LIVE]->(l:Location)
    WHERE s.name=\"open\" and id(u) <> #{user_id} and id(uu)=#{user_id} and st.order=1 and trim(split(sl.address, ',')[length(split(sl.address, ','))-2])=trim(split(l.address, ',')[length(split(l.address, ','))-2])
    RETURN id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date,
    t.vehicle as vehicle, p.first_name+" "+p.last_name as leader_name, s.name as status
    ORDER BY t.created_date DESC
    LIMIT 10
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{id: user_id}, %{type: "ViewTripsListNew"})do
      cypher="""
      MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER{role: \"leader\"}]->(t:Trip)-[:HAVE]->(s:Status)
      WHERE s.name=\"open\" and id(u) <> #{user_id} 
      RETURN id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date,
      t.vehicle as vehicle, p.first_name+" "+p.last_name as leader_name, s.name as status
      ORDER BY t.created_date DESC
      """
      Sips.query!(Sips.conn, cypher)
    end
    def retrieve(%{id: user_id}, %{type: "ViewTripsListFinish"})do
      cypher="""
      MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER{role: \"leader\"}]->(t:Trip)-[:HAVE]->(s:Status)
      WHERE s.name=\"finish\" and id(u) <> #{user_id} 
      RETURN id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date,
      t.vehicle as vehicle, p.first_name+" "+p.last_name as leader_name, s.name as status
      ORDER BY t.created_date DESC
      LIMIT 10
      """
      Sips.query!(Sips.conn, cypher)
    end
  def retrieve(%{id: user_id}, %{type: "ViewMyTrips"})do
    cypher="""
    MATCH (p:Profile)<-[:HAVE]-(u:User)-[m:MEMBER]->(t:Trip)-[:HAVE]->(s:Status)
    WHERE   id(u) = #{user_id}
    RETURN id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date,
    t.vehicle as vehicle, s.name as status
    ORDER BY t.created_date DESC
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{type: "FindTrip", user_id: user_id, location: location, start_date: start_date, end_date: end_date}) do
    where_condition="WHERE s.name <> \"happen\" and id(u) <> #{user_id} and t.start_date>=#{start_date} and t.end_date<=#{end_date} and l.address=~'.*#{location}.*'"
    if start_date==0 do where_condition="WHERE s.name <> \"happen\" and id(u) <> #{user_id} and t.end_date<=#{end_date} and l.address=~'.*#{location}.*'" end
    if end_date==0 do where_condition="WHERE s.name <> \"happen\" and id(u) <> #{user_id} and t.start_date>=#{start_date} and l.address=~'.*#{location}.*'" end
    if end_date==0 && start_date==0 do where_condition="WHERE s.name <> \"happen\" and id(u) <> #{user_id} and l.address=~'.*#{location}.*'" end
    cypher="""
    MATCH (p:Profile)<-[:HAVE]-(u:User)-[:MEMBER{role: "leader"}]->(t:Trip)-[:INCLUDE]->(st:Stop)-[:LOCATE]->(l:Location), (t:Trip)-[:HAVE]->(s:Status) 
    #{where_condition}
    RETURN DISTINCT id(t) as id, t.name as name, t.start_date as start_date, t.end_date as end_date, t.background as background, t.created_date as created_date,
      t.vehicle as vehicle, p.first_name+" "+p.last_name as leader_name, s.name as status 
    ORDER BY t.created_date DESC
    """
    Sips.query!(Sips.conn, cypher)
  end
  # Get a user with username and password, setting the token in it.
  def retrieve(_, %{type: "User", username: username, password: password}, _context) do
    # @TODO: Hash password.
    cypher="MATCH (u:User) WHERE u.email=\"#{username}\" and u.pass=\"#{password}\" return id(u) as id, u.email as email, u.last_logout as last_logout"
    Sips.query!(Sips.conn, cypher)
    |> Enum.at(0)
    |> case do
      nil -> nil
      %{"id" => id} = user ->
        token = user
        |> Joken.token
        |> Joken.with_signer(Joken.hs256("#{@jwt_secret}"))
        |> Joken.with_sub(id)
        |> Joken.sign
        |> Joken.get_compact

        Map.put(user, "token", token)
    end
  end
  def retrieve(_, %{type: "User", username: username}, _context) do
    cypher="MATCH (u:User) WHERE u.email=\"#{username}\" return id(u) as id, u.pass as password"
    Sips.query!(Sips.conn, cypher)
    |> Enum.at(0)
  end

  # Retrieve the logged in user. This is different than the normal query for any user, since it
  # can return private info.
  def retrieve(_source, %{type: "User", id: id}, %{root_value: %{user: %{"id" => id}}}) do
    cypher = """
    MATCH (u:User)-[:HAVE]->(p:Profile)
    WHERE id(u)=#{id} 
    RETURN p.first_name +" "+ p.last_name as full_name, p.avatar as avatar
    """

    Sips.query!(Sips.conn, cypher)
    |> Enum.at(0)
  end

  def retrieve(_source, %{type: "User", id: id}, _context) when is_nil(id) == false do
    cypher = """
    MATCH (u:User)-[:HAVE]->(p:Profile)
    WHERE id(u)=#{id} 
    RETURN u.last_logout as last_logout, p.first_name +" "+ p.last_name as full_name, p.avatar as avatar
    """

    Sips.query!(Sips.conn, cypher)
    |> Enum.at(0)
  end

  ## UPDATES ##
  def update(%{type: "Mode", stop_id: stop_id, route_mode: route_mode, route_distance: route_distance, route_duration: route_duration, stop_arrive: stop_arrive, stop_departure: stop_departure}) do
    cypher= """
    MATCH (s:Stop)-[:THROUGH]->(r:Route)-[m:MODE]->(v:Vehicle), (v2: Vehicle{name:\"#{route_mode}\"})
    WHERE id(s)=#{stop_id}
    DELETE m
    CREATE (r)-[:MODE]->(v2)
    SET r.distance=#{route_distance}, r.duration=#{route_duration}, s.arrive=#{stop_arrive}, s.departure=#{stop_departure}
    """
    Sips.query!(Sips.conn, cypher)
  end
  def update(_, %{type: "Trip", id: trip_id, trip_name: trip_name, start_date: start_date, end_date: end_date, description: description, estimated_cost: estimated_cost, estimated_members: estimated_members, cost_detail: cost_detail, off_time: off_time, off_place: off_place, necessary_tool: necessary_tool, note: note, status: status}, _context) do
    description=String.replace(description, "\\", "\\\\")
    description=String.replace(description, "\"", "\\\"")
    cost_detail=String.replace(cost_detail, "\\", "\\\\")
    cost_detail=String.replace(cost_detail, "\"", "\\\"")
    necessary_tool=String.replace(necessary_tool, "\\", "\\\\")
    necessary_tool=String.replace(necessary_tool, "\"", "\\\"")
    note=String.replace(note, "\\", "\\\\")
    note=String.replace(note, "\"", "\\\"")
    off_place=String.replace(off_place, "\\", "\\\\")
    # IO.inspect("--------------------------------------------------------------");
    # IO.inspect(description);
    cypher="""
    MATCH (t:Trip)-[h:HAVE]->(s:Status), (s1:Status{name:"#{status}"})
    WHERE id(t)=#{trip_id}
    DELETE h
    SET t.trip_name=\"#{trip_name}\", t.start_date=#{start_date}, t.end_date=#{end_date}, t.description=\"#{description}\", t.estimated_cost=#{estimated_cost}, 
    t.estimated_number_of_members=#{estimated_members}, t.cost_detail=\"#{cost_detail}\", t.off_time= #{off_time}, t.off_place= \"#{off_place}\",
    t.necessary_tool= \"#{necessary_tool}\", t.note=\"#{note}\"
    CREATE (t)-[:HAVE]->(s1)
    """
    # IO.inspect(cypher);
    Sips.query!(Sips.conn, cypher)

  end

  # Update a user.
  def update(_, %{type: "User", id: id} = args, _context) do
    updates = args
    |> Map.delete(:type)
    |> Map.delete(:id)
    |> Enum.map_join(", ", fn({key, value}) -> 
      "user.#{key} = #{value}"
    end)

    cypher = """
    MATCH (user:User)
    WHERE id(user)=#{id}
    SET #{updates}
    """

    Sips.query!(Sips.conn, cypher)
  end


  def create(%{type: "Member", trip_id: trip_id, user_id: user_id, phone_number: phone_number, slot: slot, driver: driver}) do
    created_date= DateTime.to_unix(DateTime.utc_now())*1000
    cypher="""
    MATCH (l:User)-[:MEMBER{role:"leader"}]->(t:Trip), (u:User)
    WHERE id(u)=#{user_id} and id(t)=#{trip_id}
    CREATE (u)-[:MEMBER{role: \"member\", joined_date: #{created_date}, phone_number: \"#{phone_number}\", slot: #{slot}, driver: \"#{driver}\", status: "waiting"}]->(t)
    RETURN id(l) as leader_id
    """
    Sips.query!(Sips.conn, cypher)
  end
  def update(%{type: "Member", member_id: member_id, status: status}) do
    cypher="""
    MATCH (u:User)-[m:MEMBER]->(t:Trip)
    WHERE id(m)=#{member_id}
    SET m.status="#{status}"
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{"id" => trip_id}, %{type: "Member"}, _context) do
    cypher="""
    MATCH (p:Profile)<-[:HAVE]-(u:User)-[m:MEMBER]->(t:Trip) 
    where id(t)=#{trip_id} 
    return id(m) as id, id(u) as user_id, p.first_name +" "+ p.last_name as full_name, p.hometown as hometown, m.joined_date as joined_date, m.lat as lat, m.lng as lng, m.role as role, p.avatar as avatar, m.status as status 
    """
     Sips.query!(Sips.conn, cypher)
  end
  def create(%{type: "Noti", receiver_id: receiver_id, sender_id: sender_id, content_id: trip_id, content: content}) do
    created_date= DateTime.to_unix(DateTime.utc_now())*1000
    cypher="""
    MATCH (u1:User), (u2:User)
    WHERE id(u1)=#{sender_id} and id(u2)=#{receiver_id}
    CREATE (n:Notification{content: \"#{content}\", created_date: #{created_date}, content_id: "#{trip_id}", status: "unread"})
    CREATE (u1)-[:SEND]->(n)<-[:RECEIVE]-(u2)
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{type: "Noti", receiver_id: receiver_id}) do
    cypher="""
    MATCH (u:User)-[:RECEIVE]-(n:Notification)<-[:SEND]-(u2:User)-[:HAVE]->(p:Profile)
    WHERE n.status="unread" and id(u)=#{receiver_id}
    RETURN n.content as content, n.content_id as content_id, p.avatar as avatar, id(n) as id
    """
    Sips.query!(Sips.conn, cypher)
  end
  def update(%{type: "Noti", noti_id: noti_id}) do
    cypher= """
    MATCH (n:Notification)
    WHERE id(n)=#{noti_id}
    SET n.status="read" 
    """
    Sips.query!(Sips.conn, cypher)
  end

  def retrieve(%{type: "UserSimpleInfo", user_id: user_id}) do
  cypher= """
    MATCH (u:User)-[:HAVE]->(p:Profile)
    WHERE id(u)=#{user_id} 
    RETURN p.first_name +" "+ p.last_name as full_name, p.avatar as avatar
    """
    Sips.query!(Sips.conn, cypher)
  end
  def retrieve(%{type: "StopImages", trip_id: trip_id}) do
    cypher="""
    MATCH (t:Trip)-[:INCLUDE]->(s:Stop)-[:HAVE]->(i:Image)
    WHERE id(t)=#{trip_id}
    RETURN id(s) as stop_id, i.url as url, i.description as description
    ORDER BY s.order, id(i)
    """
    Sips.query!(Sips.conn, cypher)
  end
  def create(%{type: "StopImages"}, url: url, description: description, stop_id:  stop_id) do
    cypher="""
      MATCH (s:Stop)
      WHERE id(s)=#{stop_id}
      CREATE (i:Image{url: "#{url}", description: "#{description}"})
    """
    Sips.query!(Sips.conn, cypher)
  end
  def delete(%{type: "Stop", trip_id: trip_id, stop_id: stop_id}) do
    cypher="""
      MATCH (t:Trip)-[i:INCLUDE]->(s:Stop)-[th:THROUGH]->(r:Route), (s:Stop)-[lt:LOCATE]->(l:Location)
      WHERE id(t)=#{trip_id} and id(s)=#{stop_id}
      DELETE i, th, lt, r, s
      """
      Sips.query!(Sips.conn, cypher)
  end
  # Callbacks for being a Plug used in Router.
  @behaviour Plug
  def init(opts) do
    [schema: {Backend.Schema, :root}, root_value: {Backend, :root_value}]
    |> Keyword.merge(opts)
    |> GraphQL.Plug.init()
  end

  def call(conn, opts) do
    GraphQL.Plug.call(conn, opts)
  end

  def root_value(conn) do
    # The map we return here will be made available to our resolve/3 functions.
    # We can include any data we want, however right now we're only interested in
    # the currently logged in user and the URL the app is running at.
    endpoint_conf = Application.get_env(:bsn_web, BsnWeb.Endpoint)
    url = endpoint_conf
    |> Keyword.get(:url) 
    |> Enum.into(%{})
    |> case do
      %{port: port} = url -> url
      url ->
        port = endpoint_conf
              |> Keyword.get(:http)
              |> Keyword.get(:port)
        Map.put(url, :port, port)
    end

    %{user: conn.assigns[:user], url: url}
  end
end