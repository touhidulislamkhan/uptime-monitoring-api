// dependencies
const fs = require("fs");
const path = require("path");

// module scaffolding
const lib = {};

// determining the base directory
lib.baseDir = path.join(__dirname, "../.data/");

// function to write file
lib.create = (dir, file, data, callback) => {
  //open file to write
  fs.open(`${lib.baseDir + dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //converting data to string
      const stringData = JSON.stringify(data);

      //writing the data
      fs.writeFile(fileDescriptor, stringData, (err2) => {
        if (!err2) {
          fs.close(fileDescriptor, (err3) => {
            if (!err3) {
              callback(false);
            } else {
              callback("Error writing new file!");
            }
          });
        }
      });
    } else {
      callback("There was an error. File may already exist.");
    }
  });
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir + dir}/${file}.json`, "utf8", (err, data) => {
    callback(err, data);
  });
};

module.exports = lib;
