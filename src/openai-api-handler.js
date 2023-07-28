const { credentials } = require("./config-handler");
const { makePostRequest } = require("./network-handler");

const OPENAI_GPT_URL = "https://api.openai.com/v1/chat/completions";

const formatData = (data) => {};

const translate = async (formattedData) => {
  const { organizationId, apiKey } = credentials;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "OpenAI-Organization": organizationId,
  };

  const payload = {};
  const result = await makePostRequest(OPENAI_GPT_URL, headers, {}, payload);
};

module.exports = {
  translate,
};
