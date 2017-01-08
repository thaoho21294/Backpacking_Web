## bsn_web/web/controllers/registration_controller.ex
defmodule BsnWeb.RegistrationController do
  use BsnWeb.Web, :controller
  alias BsnWeb.UserController, as: User

  def create(conn, %{"email"=>email, "password"=>password, "first_name"=>first_name, "last_name"=>last_name, "home_town"=>home_town}) do
    response = User.create(conn, %{email: email, password: password, first_name: first_name, last_name: last_name, home_town: home_town});
    json conn, response
  end
  def new(conn,_params)do
  	render(conn, "new.hlml")

  end
end	
