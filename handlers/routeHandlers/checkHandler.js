// Handler to handle user related routes

// dependencies
const {
   parseJson,
   hash,
   createRandomString,
} = require("../../helpers/utilities");
const lib = require("../../lib/data");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environments");

//module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
   const acceptedMethods = ["get", "post", "put", "delete"];
   if (acceptedMethods.includes(requestProperties.method)) {
      handler._check[requestProperties.method](requestProperties, callback);
   } else {
      callback(405);
   }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
   // validate inputs
   const protocol =
      typeof requestProperties.body.protocol === "string" &&
      ["http", "https"].includes(requestProperties.body.protocol)
         ? requestProperties.body.protocol
         : false;

   const url =
      typeof requestProperties.body.url === "string" &&
      requestProperties.body.url.trim().length > 0
         ? requestProperties.body.url
         : false;

   const method =
      typeof requestProperties.body.method === "string" &&
      ["get", "post", "put", "delete"].includes(
         requestProperties.body.method.toLowerCase()
      )
         ? requestProperties.body.method
         : false;

   const successCodes =
      typeof requestProperties.body.successCodes === "object" &&
      requestProperties.body.successCodes instanceof Array
         ? requestProperties.body.successCodes
         : false;

   const timeoutSeconds =
      typeof requestProperties.body.timeoutSeconds === "number" &&
      requestProperties.body.timeoutSeconds % 1 === 0 &&
      requestProperties.body.timeoutSeconds >= 1 &&
      requestProperties.body.timeoutSeconds <= 5
         ? requestProperties.body.timeoutSeconds
         : false;

   if (protocol && url && method && successCodes && timeoutSeconds) {
      const token =
         typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

      // lookup the user phone by reading the token
      lib.read("tokens", token, (err1, tokenData) => {
         if (!err1 && tokenData) {
            const userPhone = parseJson(tokenData).phone;
            // lookup the user data
            lib.read("users", userPhone, (err2, userData) => {
               if (!err2 && userData) {
                  tokenHandler._token.verifyToken(
                     token,
                     userPhone,
                     (tokenIsValid) => {
                        if (tokenIsValid) {
                           const userObject = parseJson(userData);
                           const userChecks =
                              typeof userObject.checks === "object" &&
                              userObject.checks instanceof Array
                                 ? userObject.checks
                                 : [];

                           if (userChecks.length < maxChecks) {
                              const checkId = createRandomString(20);
                              const checkObject = {
                                 id: checkId,
                                 userPhone,
                                 protocol,
                                 url,
                                 method,
                                 successCodes,
                                 timeoutSeconds,
                              };
                              // save the object
                              lib.create(
                                 "checks",
                                 checkId,
                                 checkObject,
                                 (err3) => {
                                    if (!err3) {
                                       // add check id to the user's object
                                       userObject.checks = userChecks;
                                       userObject.checks.push(checkId);

                                       // save the new user data
                                       lib.update(
                                          "users",
                                          userPhone,
                                          userObject,
                                          (err4) => {
                                             if (!err4) {
                                                // return the data about the new check
                                                callback(200, checkObject);
                                             } else {
                                                callback(500, {
                                                   error: "There was a problem in the server side!",
                                                });
                                             }
                                          }
                                       );
                                    } else {
                                       callback(500, {
                                          error: "There was a problem in the server side!",
                                       });
                                    }
                                 }
                              );
                           } else {
                              callback(401, {
                                 error: "Userhas already reached max check limit!",
                              });
                           }
                        } else {
                           callback(403, {
                              error: "Authentication problem!",
                           });
                        }
                     }
                  );
               } else {
                  callback(403, {
                     error: "User not found!",
                  });
               }
            });
         } else {
            callback(403, {
               error: "Authentication problem!",
            });
         }
      });
   } else {
      callback(400, {
         error: "You have a problem in your request",
      });
   }
};

handler._check.get = (requestProperties, callback) => {
   const id =
      typeof requestProperties.queryStringObject.id === "string" &&
      requestProperties.queryStringObject.id.trim().length === 20
         ? requestProperties.queryStringObject.id
         : false;

   if (id) {
      // lookup the check
      lib.read("checks", id, (err, checkData) => {
         if (!err && checkData) {
            const token =
               typeof requestProperties.headersObject.token === "string"
                  ? requestProperties.headersObject.token
                  : false;

            tokenHandler._token.verifyToken(
               token,
               parseJson(checkData).userPhone,
               (tokenIsValid) => {
                  if (tokenIsValid) {
                     callback(200, parseJson(checkData));
                  } else {
                     callback(403, {
                        error: "Authentication failure!",
                     });
                  }
               }
            );
         } else {
            callback(500, {
               error: "You have a problem in your request",
            });
         }
      });
   } else {
      callback(400, {
         error: "You have a problem in your request",
      });
   }
};

handler._check.put = (requestProperties, callback) => {
   const id =
      typeof requestProperties.body.id === "string" &&
      requestProperties.body.id.trim().length === 20
         ? requestProperties.body.id
         : false;

   // validate inputs
   const protocol =
      typeof requestProperties.body.protocol === "string" &&
      ["http", "https"].includes(requestProperties.body.protocol)
         ? requestProperties.body.protocol
         : false;

   const url =
      typeof requestProperties.body.url === "string" &&
      requestProperties.body.url.trim().length > 0
         ? requestProperties.body.url
         : false;

   const method =
      typeof requestProperties.body.method === "string" &&
      ["get", "post", "put", "delete"].includes(
         requestProperties.body.method.toLowerCase()
      )
         ? requestProperties.body.method
         : false;

   const successCodes =
      typeof requestProperties.body.successCodes === "object" &&
      requestProperties.body.successCodes instanceof Array
         ? requestProperties.body.successCodes
         : false;

   const timeoutSeconds =
      typeof requestProperties.body.timeoutSeconds === "number" &&
      requestProperties.body.timeoutSeconds % 1 === 0 &&
      requestProperties.body.timeoutSeconds >= 1 &&
      requestProperties.body.timeoutSeconds <= 5
         ? requestProperties.body.timeoutSeconds
         : false;

   if (id) {
      if (protocol || url || method || successCodes || timeoutSeconds) {
         lib.read("checks", id, (err1, checkData) => {
            if (!err1 && checkData) {
               const checkObject = parseJson(checkData);
               const token =
                  typeof requestProperties.headersObject.token === "string"
                     ? requestProperties.headersObject.token
                     : false;

               tokenHandler._token.verifyToken(
                  token,
                  checkObject.userPhone,
                  (tokenIsValid) => {
                     if (tokenIsValid) {
                        if (protocol) {
                           checkObject.protocol = protocol;
                        }
                        if (url) {
                           checkObject.url = url;
                        }
                        if (method) {
                           checkObject.method = method;
                        }
                        if (successCodes) {
                           checkObject.successCodes = successCodes;
                        }
                        if (timeoutSeconds) {
                           checkObject.timeoutSeconds = timeoutSeconds;
                        }
                        // store the checkObject
                        lib.update("checks", id, checkObject, (err2) => {
                           if (!err2) {
                              callback(200);
                           } else {
                              callback(500, {
                                 error: "There was a server side error!",
                              });
                           }
                        });
                     } else {
                        callback(403, {
                           error: "Authentication error!",
                        });
                     }
                  }
               );
            } else {
               callback(500, {
                  error: "There was a problem in the server side!",
               });
            }
         });
      } else {
         callback(400, {
            error: "You must provide at least one field to update!",
         });
      }
   } else {
      callback(400, {
         error: "You have a problem in your request",
      });
   }
};

handler._check.delete = (requestProperties, callback) => {
   const id =
      typeof requestProperties.queryStringObject.id === "string" &&
      requestProperties.queryStringObject.id.trim().length === 20
         ? requestProperties.queryStringObject.id
         : false;

   if (id) {
      // lookup the check
      lib.read("checks", id, (err1, checkData) => {
         if (!err1 && checkData) {
            const token =
               typeof requestProperties.headersObject.token === "string"
                  ? requestProperties.headersObject.token
                  : false;

            tokenHandler._token.verifyToken(
               token,
               parseJson(checkData).userPhone,
               (tokenIsValid) => {
                  if (tokenIsValid) {
                     // delete the check data
                     lib.delete("checks", id, (err2) => {
                        if (!err2) {
                           lib.read(
                              "users",
                              parseJson(checkData).userPhone,
                              (err3, userData) => {
                                 const userObject = parseJson(userData);
                                 if (!err3 && userData) {
                                    const userChecks =
                                       typeof userObject.checks === "object" &&
                                       userObject.checks instanceof Array
                                          ? userObject.checks
                                          : [];

                                    // remove the deleted check id from user's list of checks
                                    const checkPosition =
                                       userChecks.indexOf(id);
                                    if (checkPosition > -1) {
                                       userChecks.splice(checkPosition, 1);
                                       // resave the user data
                                       userObject.checks = userChecks;
                                       lib.update(
                                          "users",
                                          userObject.phone,
                                          userObject,
                                          (err4) => {
                                             if (!err4) {
                                                callback(200);
                                             } else {
                                                callback(500, {
                                                   error: "There was a server side problem!",
                                                });
                                             }
                                          }
                                       );
                                    } else {
                                       callback(500, {
                                          error: "The check id that you are trying to remove is not found in user!",
                                       });
                                    }
                                 } else {
                                    callback(500, {
                                       error: "There was a server side problem!",
                                    });
                                 }
                              }
                           );
                        } else {
                           callback(500, {
                              error: "There was a server side problem!",
                           });
                        }
                     });
                  } else {
                     callback(403, {
                        error: "Authentication failure!",
                     });
                  }
               }
            );
         } else {
            callback(500, {
               error: "You have a problem in your request",
            });
         }
      });
   } else {
      callback(400, {
         error: "You have a problem in your request",
      });
   }
};

module.exports = handler;
