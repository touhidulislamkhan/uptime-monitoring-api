// Handler to handle user related routes

// dependencies
const { hash } = require("../../helpers/utilities");
const lib = require("../../lib/data");
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
   callback(200);
};
handler._user.put = (requestProperties, callback) => {};
handler._user.delete = (requestProperties, callback) => {};

module.exports = handler;
