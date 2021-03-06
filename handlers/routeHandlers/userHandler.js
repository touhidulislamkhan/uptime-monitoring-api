// Handler to handle user related routes

// dependencies
const { parseJson, hash } = require("../../helpers/utilities");
const lib = require("../../lib/data");
const tokenHandler = require("./tokenHandler");
//module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
   const acceptedMethods = ["get", "post", "put", "delete"];
   if (acceptedMethods.includes(requestProperties.method)) {
      handler._user[requestProperties.method](requestProperties, callback);
   } else {
      callback(405);
   }
};

handler._user = {};

handler._user.post = (requestProperties, callback) => {
   const firstName =
      typeof requestProperties.body.firstName === "string" &&
      requestProperties.body.firstName.trim().length > 0
         ? requestProperties.body.firstName
         : null;
   const lastName =
      typeof requestProperties.body.lastName === "string" &&
      requestProperties.body.lastName.trim().length > 0
         ? requestProperties.body.lastName
         : null;
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
   const tosAgreement =
      typeof requestProperties.body.tosAgreement === "boolean" &&
      requestProperties.body.tosAgreement
         ? requestProperties.body.tosAgreement
         : false;

   if (firstName && lastName && phone && password && tosAgreement) {
      lib.read("users", phone, (err, data) => {
         if (err) {
            const userObject = {
               firstName,
               lastName,
               phone,
               password: hash(password),
               tosAgreement,
            };
            lib.create("users", phone, userObject, (err1) => {
               if (!err1) {
                  callback(200, {
                     message: "User was created successfully!",
                  });
               } else {
                  callback(500, {
                     error: "There was a server error",
                  });
               }
            });
         } else {
            callback(500, {
               error: "There was a problem in the server!",
            });
         }
      });
   } else {
      callback(400, {
         error: "You have a problem in your request!",
      });
   }
};

handler._user.get = (requestProperties, callback) => {
   // check if phone number is valid
   const phone =
      typeof requestProperties.queryStringObject.phone === "string" &&
      requestProperties.queryStringObject.phone.trim().length === 11
         ? requestProperties.queryStringObject.phone
         : null;
   if (phone) {
      //verify token
      const token =
         typeof requestProperties.headersObject.token === "string" &&
         requestProperties.headersObject.token.trim().length === 20
            ? requestProperties.headersObject.token
            : null;

      tokenHandler._token.verifyToken(token, phone, (verification) => {
         if (verification) {
            //look up user
            lib.read("users", phone, (err, data) => {
               const user = { ...parseJson(data) };
               if (!err && user) {
                  delete user.password;
                  callback(200, user);
               } else {
                  callback(404, {
                     error: "User Not Found!",
                  });
               }
            });
         } else {
            callback(403, {
               error: "Authentication failed!",
            });
         }
      });
   } else {
      callback(404, {
         error: "User Not Found!",
      });
   }
};

handler._user.put = (requestProperties, callback) => {
   // check if phone number is valid
   const phone =
      typeof requestProperties.body.phone === "string" &&
      requestProperties.body.phone.trim().length === 11
         ? requestProperties.body.phone
         : null;

   const firstName =
      typeof requestProperties.body.firstName === "string" &&
      requestProperties.body.firstName.trim().length > 0
         ? requestProperties.body.firstName
         : null;
   const lastName =
      typeof requestProperties.body.lastName === "string" &&
      requestProperties.body.lastName.trim().length > 0
         ? requestProperties.body.lastName
         : null;

   const password =
      typeof requestProperties.body.password === "string" &&
      requestProperties.body.password.trim().length > 0
         ? requestProperties.body.password
         : null;

   if (phone) {
      if (firstName || lastName || password) {
         //verify token
         const token =
            typeof requestProperties.headersObject.token === "string" &&
            requestProperties.headersObject.token.trim().length === 20
               ? requestProperties.headersObject.token
               : null;

         tokenHandler._token.verifyToken(token, phone, (verification) => {
            if (verification) {
               // lookup the user
               lib.read("users", phone, (err, data) => {
                  if (!err && data) {
                     const userData = { ...parseJson(data) };
                     if (firstName) {
                        userData.firstName = firstName;
                     }
                     if (lastName) {
                        userData.lastName = lastName;
                     }
                     if (password) {
                        userData.password = hash(password);
                     }

                     //update to database
                     lib.update("users", phone, userData, (err2) => {
                        if (!err2) {
                           callback(200, {
                              message: "Information Updated Successfulle!",
                           });
                        } else {
                           callback(500, {
                              error: "There was a serve side error",
                           });
                        }
                     });
                  } else {
                     callback(400, {
                        error: "You have a problem in your request!",
                     });
                  }
               });
            } else {
               callback(403, {
                  error: "Authentication failed!",
               });
            }
         });
      } else {
         callback(400, {
            error: "You have a problem in your request!",
         });
      }
   } else {
      callback(400, {
         error: "Invalid Phone Number. Please try again!",
      });
   }
};

handler._user.delete = (requestProperties, callback) => {
   // check if phone number is valid
   const phone =
      typeof requestProperties.queryStringObject.phone === "string" &&
      requestProperties.queryStringObject.phone.trim().length === 11
         ? requestProperties.queryStringObject.phone
         : null;

   if (phone) {
      //verify token
      const token =
         typeof requestProperties.headersObject.token === "string" &&
         requestProperties.headersObject.token.trim().length === 20
            ? requestProperties.headersObject.token
            : null;

      tokenHandler._token.verifyToken(token, phone, (verification) => {
         if (verification) {
            // look for user
            lib.read("users", phone, (err, data) => {
               if (!err && data) {
                  lib.delete("users", phone, (err1) => {
                     if (!err1) {
                        callback(200, {
                           message: "User was deleted successfully!",
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
            callback(403, {
               error: "Authentication failed!",
            });
         }
      });
   } else {
      callback(400, {
         error: "There was a problem in your request!",
      });
   }
};

module.exports = handler;
