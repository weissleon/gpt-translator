const { checkIfFileExists } = require("./src/fs-handler");
const { translate } = require("./src/openai-api-handler");
const {
  showWelcomeMessage,
  showFilePathInputMessage,
} = require("./src/ui-handler");

const run = async () => {
  showWelcomeMessage();

  await showFilePathInputMessage(
    (filePath) => checkIfFileExists(filePath) || "Please recheck the file path"
  );

  await translate("hi");
};

run();
