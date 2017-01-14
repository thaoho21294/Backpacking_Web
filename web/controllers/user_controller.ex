defmodule BsnWeb.UserController do
  use BsnWeb.Web, :controller
  alias Neo4j.Sips, as: Neo4j
  alias BsnWeb.Backend

  def get_friends_name(conn, %{"id"=>userid}) do
  	cypher= "MATCH (u1:User)-[:FRIEND]->(u2:User)-[:HAVE]->(p:Profile) WHERE id(u1)=#{userid} return p.first_name+' '+p.last_name"
  	friends_name=Neo4j.query!(Neo4j.conn, cypher)
  	render(conn, "friends_name.json",friends_name: friends_name)
  end
  #after checking input client pass
  def create(conn, %{"email"=>email, "password"=>password, "first_name"=>first_name, "last_name"=>last_name, "home_town"=>home_town}) do
    response=Backend.retrieve(%{type: "CreateUser", email: email, password: password, first_name: first_name, last_name: last_name })
    json conn, response
  end
  def get_simple_info(conn, %{"id"=>user_id}) do
    info=Backend.retrieve(%{type: "UserSimpleInfo", user_id: user_id})
    render(conn, "get_simple_info.json", info: info)
  end
end
