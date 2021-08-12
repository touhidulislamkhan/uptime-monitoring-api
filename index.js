// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');

// module scaffolding
const app = {};

// configurations
app.config = {
    port: 3000,
};

// creating server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`Listening to port ${app.config.port}`);
    });
}

// handle request response
app.handleReqRes = handleReqRes;

// starting server
app.createServer();

