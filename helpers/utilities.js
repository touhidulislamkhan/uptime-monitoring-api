// utility functions

// dependencies
const crypto = require("crypto");

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
      const hash = crypto.createHmac("sha256").update(str).digest("hex");
      return hash;
   }
   return false;
};

module.exports = utilities;
