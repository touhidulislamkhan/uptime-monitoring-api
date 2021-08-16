// dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
   notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");

// module scaffolding
const handler = {};

//handling request response
handler.handleReqRes = (req, res) => {
   //handling the request
   //parsing url
   const parsedUrl = url.parse(req.url, true);
   // const parsedUrl = new URL(req.url); //new whatwg url api
   const path = parsedUrl.pathname;
   const trimmedPath = path.replace(/^\/|\/+$/g, "");
   const method = req.method.toLowerCase();
   const queryStringObject = parsedUrl.query;
   const headersObject = req.headers;

   const requestProperties = {
      parsedUrl,
      path,
      trimmedPath,
      method,
      queryStringObject,
      headersObject,
   };

   const decoder = new StringDecoder("utf-8");
   let realData = "";

   const chosenHandler = routes[trimmedPath]
      ? routes[trimmedPath]
      : notFoundHandler;

   req.on("data", (buffer) => {
      realData += decoder.write(buffer);
   });

   req.on("end", () => {
      realData += decoder.end();

      chosenHandler(requestProperties, (statusCode, payload) => {
         statusCode = typeof statusCode === "number" ? statusCode : 500;
         payload = typeof payload === "object" ? payload : {};

         const payloadString = JSON.stringify(payload);

         res.setHeader("Content-Type", "application/json");
         res.writeHead(statusCode);
         res.end(payloadString);
      });
      //handle response
      res.end("hello world");
   });
   //  console.log(res);

   // console.log(parsedUrl);
};

module.exports = handler;
