const env = require("./config/env");
const { initErrorHandling } = require("./errors/init");
const createApp = require("./app");

initErrorHandling();

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`BrickFi API running on http://localhost:${env.port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${env.port} is already in use. Stop the other process or set PORT to a free port.`);
    process.exit(1);
  }
  throw error;
});
