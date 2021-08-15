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

// update data
lib.update = (dir, file, data, callback) => {
   // opening to read
   fs.open(`${lib.baseDir + dir}/${file}.json`, "r+", (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
         //converting to json
         const stringData = JSON.stringify(data);

         //truncating file
         fs.ftruncate(fileDescriptor, (err1) => {
            if (!err1) {
               //writing new data
               fs.writeFile(fileDescriptor, stringData, (err2) => {
                  if (!err2) {
                     //close the file
                     fs.close(fileDescriptor, (err3) => {
                        if (!err3) {
                           callback(false);
                        } else {
                           callback("Error closing the file");
                        }
                     });
                  } else {
                     callback("error writing the file!");
                  }
               });
            } else {
               callback("Error truncating file!");
            }
         });
      } else {
         callback("Error opening. The file may not exist.");
      }
   });
};

// deleting file
lib.delete = (dir, file, callback) => {
   fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
      if (!err) {
         callback(false);
      } else {
         callback("Error deleting file!");
      }
   });
};
module.exports = lib;
