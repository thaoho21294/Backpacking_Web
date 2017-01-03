defmodule BsnWeb.UserController do
  use BsnWeb.Web, :controller
  alias Neo4j.Sips, as: Neo4j

  def get_friends_name(conn, %{"id"=>userid}) do
  	cypher= "MATCH (u1:User)-[:FRIEND]->(u2:User)-[:HAVE]->(p:Profile) WHERE id(u1)=#{userid} return p.first_name+' '+p.last_name"
  	friends_name=Neo4j.query!(Neo4j.conn, cypher)
  	render(conn, "friends_name.json",friends_name: friends_name)
  end
  def check_login(conn, %{"email"=>email, "password"=>password}) do
  	cypher="MATCH (u:User) WHERE u.email=\"#{email}\" and u.pass=\"#{password}\" return id(u) as id"
  	users=Neo4j.query!(Neo4j.conn, cypher)
  	if Enum.empty?(users) do
  		render(conn, "login.html", message: "Sai mật khẩu hoặc email!")
  	else
  		conn=put_session(conn, :userid, Map.get(Enum.at(users, 0), 'id'))
  		redirect conn, to: "/"
  	end
  end
end
