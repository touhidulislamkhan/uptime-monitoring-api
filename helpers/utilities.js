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

module.exports = utilities;
