const yaml = require("js-yaml");
const { readFile } = require("./fs-handler");

const CREDENTIALS_FILEPATH = "./config/credentials.yaml";
const CONFIG_FILEPATH = "./config/config.yaml";

const loadYamlFile = (filePath) => {
  const rawData = readFile(filePath);
  const credentials = yaml.load(rawData);

  return credentials;
};

const loadCredentialData = () => {
  return loadYamlFile(CREDENTIALS_FILEPATH);
};

const loadConfigData = () => {
  return loadYamlFile(CONFIG_FILEPATH);
};

module.exports = {
  credentials: loadCredentialData(),
  config: loadConfigData(),
};
