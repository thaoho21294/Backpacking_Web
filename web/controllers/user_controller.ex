defmodule BsnWeb.UserController do
  use BsnWeb.Web, :controller
  alias Neo4j.Sips, as: Neo4j

  def get_friends_name(conn, %{"id"=>userid}) do
  	cypher= "MATCH (u1:User)-[:FRIEND]->(u2:User)-[:HAVE]->(p:Profile) WHERE id(u1)=#{userid} return p.first_name+' '+p.last_name"
  	friends_name=Neo4j.query!(Neo4j.conn, cypher)
  	render(conn, "friends_name.json",friends_name: friends_name)
  end
end
