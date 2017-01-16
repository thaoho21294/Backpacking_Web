# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration

# Configures the endpoint
config :bsn_web, BsnWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "DkVQeZLlv3p1gLKUSJLKzXDEGg2LCCtD4sCM+l7oeiWAM7aA24QZsIWMw0Z+o6HQ",
  render_errors: [view: BsnWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: BsnWeb.PubSub,
           adapter: Phoenix.PubSub.PG2]

config :bsn_web, :jwt_secret, "DkVQeZLlv3p1gLKUSJLKzXDEGg2LCCtD4sCM+l7oeiWAM7aA24QZsIWMw0Z+o6HQ"

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
