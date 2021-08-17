//dependencies
const { sampleHandler } = require("./handlers/routeHandlers/sampleHandler");
const { tokenHandler } = require("./handlers/routeHandlers/tokenHandler");
const { userHandler } = require("./handlers/routeHandlers/userHandler");

//module scaffolding
const routes = {
   sample: sampleHandler,
   user: userHandler,
   token: tokenHandler,
};

module.exports = routes;
