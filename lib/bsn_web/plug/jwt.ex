defmodule BsnWeb.Plug.Jwt do
  import Plug.Conn
  import Joken
  alias Joken.Token
  require Logger

  def init(opts) do
    [
      secret: "",
      assign: :claims
    ] |> Keyword.merge(opts)
  end

  def call(conn, opts) do
    parse_auth(conn, get_req_header(conn, "authorization"), opts)
  end

  defp parse_auth(conn, ["Bearer " <> incoming_token], opts) do
    verified_token = %Token{}
    |> with_json_module(Poison)
    |> with_signer(hs256(Keyword.get(opts, :secret)))
    |> with_compact_token(incoming_token)
    |> verify

    evaluate(conn, verified_token, Keyword.get(opts, :assign))
  end
  defp parse_auth(conn, _header, opts) do
    assign(conn, Keyword.get(opts, :assign), nil)
  end

  defp evaluate(conn, %Token{error: nil} = token, key) do
    assign(conn, key, get_claims(token))
  end
  defp evaluate(conn, %Token{error: message}, key) do
    assign(conn, key, nil)
  end
end