const { credentials, config } = require("./config-handler");
const { makePostRequest } = require("./network-handler");

const OPENAI_GPT_URL = "https://api.openai.com/v1/chat/completions";

const translate = async (instructionData, inputData) => {
  const { organizationId, apiKey } = credentials;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "OpenAI-Organization": organizationId,
  };

  const payload = {
    model: "gpt-4",
    message: [
      {
        role: "system",
        content: instructionData,
      },
      {
        role: "user",
        content: inputData,
      },
    ],
  };
  const result = await makePostRequest(OPENAI_GPT_URL, headers, {}, payload);

  const data = await result.json();

  return data;
};

module.exports = {
  translate,
};
