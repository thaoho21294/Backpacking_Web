defmodule BsnWeb.Mixfile do
  use Mix.Project

  def project do
    [app: :bsn_web,
     version: "0.0.1",
     elixir: "~> 1.2",
     elixirc_paths: elixirc_paths(Mix.env),
     compilers: [:phoenix, :gettext] ++ Mix.compilers,
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
     deps: deps()]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [mod: {BsnWeb, []},
     applications: [:phoenix, :phoenix_pubsub, :phoenix_html,:neo4j_sips,
					:cowboy, :logger, :gettext, :httpoison, :graphql]]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "web", "test/support"]
  defp elixirc_paths(_),     do: ["lib", "web"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [{:phoenix, "~> 1.2.1"},
     {:phoenix_pubsub, "~> 1.0"},
     {:phoenix_html, "~> 2.6"},
     {:phoenix_live_reload, "~> 1.0", only: :dev},
     {:gettext, "~> 0.11"},
	   {:neo4j_sips, "~> 0.2.10"},
     {:cowboy, "~> 1.0"},
     {:httpoison, "~> 0.10.0"},
     {:graphql, "~> 0.3"},
     {:graphql_relay, "~> 0.5"},
     {:plug_graphql, "~> 0.3.1"}
   ]
  end
end
