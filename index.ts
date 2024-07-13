import fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import AutoLoad from "@fastify/autoload";
import "dotenv/config";

const server = fastify().withTypeProvider<TypeBoxTypeProvider>();

// Register Fastify Routes
server.register(AutoLoad, {
  dir: `${__dirname}/routes`,
  dirNameRoutePrefix: true,
});

// Start Fastify Server
const port = Number(process.env.PORT) || 8080;

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(`Hey server is running at ${address}`);
});
