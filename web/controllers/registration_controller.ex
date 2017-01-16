## bsn_web/web/controllers/registration_controller.ex
defmodule BsnWeb.RegistrationController do
  use BsnWeb.Web, :controller
  alias BsnWeb.Backend

  def new(conn,_params)do
  conn 
    |>put_layout("login.html")
    |>render ("new.html")
  end

  def create(conn, %{"user" => user_params})do
    #check null
    if is_nil(user_params["first_name"]) || is_nil(user_params["email"]) || is_nil(user_params["hometown"]) || is_nil(user_params["password"]) || is_nil(user_params["password_confirmation"]) do
      conn
      |> put_flash(:error, "Nhập thiếu thông tin")
      |> redirect(to: registration_path(conn, :new)) 
    else 
      email= Backend.retrieve(nil, %{type: "User", username: user_params["email"]}, nil)
      email |>
      register(user_params, conn) 
    end
  end

  def register(email, user_params, conn) when is_map(email) do
     conn
      |> put_flash(:error, "Email người dùng này đã tồn tại")
      |> redirect(to: registration_path(conn, :new))
  end
  def register(email, user_params, conn) when is_nil(email) do
    password = user_params["password"]
    password_confirmation = user_params["password_confirmation"]

    if password != password_confirmation do
      conn
      |> put_flash(:error, "password nhập lại chưa đúng")
      |> redirect(to: registration_path(conn, :new))
    else
      last_name = ""
      email = user_params["email"]
      password = user_params["password"]
      first_name = user_params["first_name"]
      hometown = user_params["hometown"]
      gender = user_params["gender"]
      response = Backend.create(%{type: "User", email: email, password: password, first_name: first_name, last_name: last_name, hometown: hometown, gender: gender}, nil)
      conn
      |> put_flash(:info, "Đăng ký thành công")
      |> redirect(to: session_path(conn, :new))
    end

  end

end 