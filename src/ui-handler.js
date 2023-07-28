const prompts = require("prompts");
const progressBar = require("cli-progress");
const { config } = require("./config-handler");
const chalk = require("chalk");

const showWelcomeMessage = () => {
  const { version, title } = config;
  console.log(`Welcome to ${chalk.yellowBright(title)} v${version}\n`);
};

const showFilePathInputMessage = async (validate = (filePath = "") => {}) => {
  const { filePath } = await prompts({
    message: "Please specify the excel file path",
    name: "filePath",
    type: "text",
    validate: validate,
  });

  return filePath;
};

const showConfirmMessage = async (message) => {
  const { confirm } = await prompts({
    message: message,
    name: "confirm",
    type: "confirm",
  });

  return confirm;
};

const showExitMessage = (message) => {
  const readline = require("readline");

  console.log(message);
  console.log("Press any key to exit...");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", (line) => rl.close());
  rl.on("close", () => process.exit());
};

module.exports = {
  showWelcomeMessage,
  showFilePathInputMessage,
  showConfirmMessage,
  showExitMessage,
};
