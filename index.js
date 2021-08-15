// dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const environment = require("./helpers/environments");

// module scaffolding
const app = {};

// configurations
app.config = {
  port: 3000,
};

// creating server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

// handle request response
app.handleReqRes = handleReqRes;

// starting server
app.createServer();
