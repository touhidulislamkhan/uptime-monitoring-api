// utility functions

// dependencies
const crypto = require("crypto");
const environments = require("../helpers/environments");

// module scaffolding
const utilities = {};

// json string to valid object
utilities.parseJson = (jsonString) => {
   let output;

   try {
      output = JSON.parse(jsonString);
   } catch (error) {
      output = {};
      console.log("Error parsing json");
   }

   return output;
};

// hashing
utilities.hash = (str) => {
   if (typeof str === "string" && str.length > 0) {
      const hash = crypto
         .createHmac("sha256", environments.secretKey)
         .update(str)
         .digest("hex");
      return hash;
   }
   return false;
};

//create random string
utilities.createRandomString = (strLength) => {
   const length =
      typeof strLength === "number" && strLength > 0 ? strLength : null;

   if (length) {
      const possibleCharacters = "abcdefghijklmnopqrstuvwxyz11234567890";
      let output = "";
      for (let i = 1; i <= length; i += 1) {
         output += possibleCharacters.charAt(
            Math.floor(Math.random() * possibleCharacters.length)
         );
      }
      return output;
   }
   return null;
};

module.exports = utilities;
