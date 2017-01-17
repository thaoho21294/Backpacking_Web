defmodule BsnWeb.SessionController do
  use BsnWeb.Web, :controller
  alias BsnWeb.Backend

  plug :scrub_params, "user" when action in [:create]

  def new(conn, _params) do
    conn 
    |>put_layout("login.html")
    |>render ("new.html")
  end

  def create(conn, %{"user" => user_params})do
    user = if is_nil(user_params["email"]) do
      nil 
    else 
      Backend.retrieve(nil, %{type: "User", username: user_params["email"]}, nil)
    end 

    user |>
    sign_in(user_params["password"], conn) 
  end

  def delete(conn, _) do
    delete_session(conn, :current_user)
      |> put_flash(:info, "Đăng xuất thành công")
      |> redirect(to: session_path(conn, :new))
  end

  defp sign_in(user, password, conn) when is_nil(user) do
    conn
      |> put_flash(:error, "Không tim thấy email người dùng")
      |> redirect(to: session_path(conn, :new))
  end

  defp sign_in(user, password, conn) when is_map(user) do
    user_password=Map.get(user, "password")
    user_id=Map.get(user, "id")
    #cond do
    #Comeonin.Bcrypt.checkpw(password, user.encrypted_password) ->
    if password==user_password do
        conn
          |> put_session(:current_user, user_id)
          |> put_flash(:info, "Đăng nhập thành công")
          |> redirect(to: page_path(conn, :index))
     else
        conn
          |> put_flash(:error, "Email hoặc mật khẩu chưa đúng")
          |> redirect(to: session_path(conn, :new))
    end
  end
end