import Hapi, { Server } from "@hapi/hapi";
import "dotenv/config";
import auth from "./auth";
import routes from "./routes";

let server: Server;

async function main() {
  server = Hapi.server({
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 8080,
  });

  server.auth.scheme("api_key", auth.scheme);
  server.auth.strategy("api_key", "api_key");

  routes(server);

  await server.start();

  console.log("Server running at", server.info.uri);
}

await main();

process.on("SIGTERM", async () => {
  await server.stop();
});
process.on("SIGINT", async () => {
  await server.stop();
});
