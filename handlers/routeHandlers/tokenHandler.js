// Handler to handle token related routes

// dependencies
const {
   parseJson,
   hash,
   createRandomString,
} = require("../../helpers/utilities");
const lib = require("../../lib/data");
//module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
   const acceptedMethods = ["get", "post", "put", "delete"];
   if (acceptedMethods.includes(requestProperties.method)) {
      handler._token[requestProperties.method](requestProperties, callback);
   } else {
      callback(405);
   }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
   const phone =
      typeof requestProperties.body.phone === "string" &&
      requestProperties.body.phone.trim().length === 11
         ? requestProperties.body.phone
         : null;
   const password =
      typeof requestProperties.body.password === "string" &&
      requestProperties.body.password.trim().length > 0
         ? requestProperties.body.password
         : null;

   if (phone && password) {
      lib.read("users", phone, (err, userData) => {
         let hashedPassword = hash(password);
         if (hashedPassword === parseJson(userData).password) {
            let tokenId = createRandomString(20);
            let expires = Date.now() * 3600 * 1000;
            const tokenObject = {
               phone,
               tokenId,
               expires,
            };

            // store the token
            lib.create("tokens", tokenId, tokenObject, (err1) => {
               if (!err1) {
                  callback(200, tokenObject);
               } else {
                  callback(500, {
                     error: "There was a problem in the server!",
                  });
               }
            });
         } else {
            callback(400, {
               error: "Password not valid!",
            });
         }
      });
   } else {
      callback(400, {
         error: "There was a problem in your request!",
      });
   }
};

handler._token.get = (requestProperties, callback) => {
   // check if token number is valid
   const tokenId =
      typeof requestProperties.queryStringObject.tokenId === "string" &&
      requestProperties.queryStringObject.tokenId.trim().length === 20
         ? requestProperties.queryStringObject.tokenId
         : null;
   if (tokenId) {
      lib.read("tokens", tokenId, (err, tokenData) => {
         if (!err && tokenData) {
            callback(200, parseJson(tokenData));
         } else {
            callback(404, {
               error: "Token Not Found!",
            });
         }
      });
   } else {
      callback(404, {
         error: "Token Not Found!",
      });
   }
};

handler._token.put = (requestProperties, callback) => {
   // check if token number is valid
   const tokenId =
      typeof requestProperties.body.tokenId === "string" &&
      requestProperties.body.tokenId.trim().length === 20
         ? requestProperties.body.tokenId
         : null;

   const extend =
      typeof requestProperties.body.extend === "boolean" &&
      requestProperties.body.extend === true
         ? true
         : false;

   if (tokenId && extend) {
      lib.read("tokens", tokenId, (err, tokenData) => {
         let tokenObject = parseJson(tokenData);
         if (tokenObject.expires > Date.now()) {
            tokenObject.expires = Date.now() * 3600 * 1000;

            // update token
            lib.update("tokens", tokenId, tokenObject, (err1) => {
               if (!err1) {
                  callback(200);
               } else {
                  callback(500, {
                     error: "There was a problem in the server!",
                  });
               }
            });
         } else {
            callback(400, {
               error: "Token already expired!",
            });
         }
      });
   } else {
      callback(400, {
         error: "There waas a problem in your request.",
      });
   }
};

handler._token.delete = (requestProperties, callback) => {
   // check if token is valid
   const tokenId =
      typeof requestProperties.queryStringObject.tokenId === "string" &&
      requestProperties.queryStringObject.tokenId.trim().length === 20
         ? requestProperties.queryStringObject.tokenId
         : null;

   if (tokenId) {
      // look for token
      lib.read("tokens", tokenId, (err, tokenData) => {
         if (!err && tokenData) {
            lib.delete("tokens", tokenId, (err1) => {
               if (!err1) {
                  callback(200, {
                     message: "Token was deleted successfully!",
                  });
               } else {
                  callback(500, {
                     error: "There was a server side error!",
                  });
               }
            });
         } else {
            callback(500, {
               error: "There was a server side error!",
            });
         }
      });
   } else {
      callback(400, {
         error: "There was a problem in your request!",
      });
   }
};

// token verification function
handler._token.verifyToken = (tokenId, phone, callback) => {
   lib.read("tokens", tokenId, (err, tokenData) => {
      if (!err && tokenData) {
         if (
            parseJson(tokenData).phone === phone &&
            parseJson(tokenData).expires > Date.now()
         ) {
            callback(true);
         } else {
            callback(false);
         }
      } else {
         callback(false);
      }
   });
};

module.exports = handler;
