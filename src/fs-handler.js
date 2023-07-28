const fs = require("fs");

const OUT_DIRPATH = "out";

const readFile = (filePath) => {
  return fs.readFileSync(filePath, { encoding: "utf-8" });
};

const checkIfFileExists = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch (error) {
    return false;
  }
};

const checkIfDirectoryExists = (dirPath) => {
  return fs.existsSync(dirPath, { encoding: "utf-8" });
};

const checkIfOutDirectoryExists = () => {
  return checkIfDirectoryExists(OUT_DIRPATH);
};

const createDirectory = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const createOutDirectory = () => {
  createDirectory(OUT_DIRPATH);
};

module.exports = {
  readFile,
  checkIfFileExists,
  checkIfOutDirectoryExists,
  createOutDirectory,
};