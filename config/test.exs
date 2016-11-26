use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :bsn_web, BsnWeb.Endpoint,
  http: [port: 4001],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :bsn_web, BsnWeb.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "bsn_web_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

config :neo4j_sips, Neo4j,
  url: "http://localhost:7474",
  basic_auth: [username: "neo4j", password: "neo4j123"],
  pool_size: 5,
  max_overflow: 2,
  timeout: 10