// dependencies

// module scaffolding
const environments = {};

environments.development = {
   port: 3000,
   envName: "development",
   secretKey: "qwertyuiop",
};

environments.staging = {
   port: 4000,
   envName: "staging",
   secretKey: "asdfghjkl",
};

environments.production = {
   port: 5000,
   envName: "production",
   secretKey: "zxcvbnm",
};

// choosing the environment

const curerntEnvironment =
   typeof process.env.NODE_ENV === "string"
      ? process.env.NODE_ENV
      : "development";

//export corresponding environment

const environmentToExport =
   typeof environments[curerntEnvironment] === "object"
      ? environments[curerntEnvironment]
      : environments.development;

module.exports = environmentToExport;
