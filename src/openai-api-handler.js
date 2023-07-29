const { credentials, config } = require("./config-handler");
const { makePostRequest } = require("./network-handler");
const { encode } = require("gpt-tokenizer");

const OPENAI_GPT_URL = "https://api.openai.com/v1/chat/completions";

const getTokenCount = (text) => {
  return encode(text).length;
};

const sliceBasedOnTokenCount = (markdownTable, maxTokenCount) => {
  const rows = markdownTable.split("\n");
  const headerSection = rows.slice(0, 2);
  const dataSection = rows.slice(2);

  const availableTokenCount =
    maxTokenCount - getTokenCount(headerSection.join("\n")) - 1;

  const slicedTable = [];
  let currentTokenCount = 0;
  let currentSlice = [];
  for (let i = 0; i < dataSection.length; i++) {
    const row = dataSection[i];
    const tokenCount = getTokenCount(row);
    currentTokenCount += tokenCount;
    if (availableTokenCount < currentTokenCount) {
      slicedTable.push(currentSlice.join("\n"));
      currentSlice = [];
      currentTokenCount = 0;
      continue;
    }
    currentSlice.push(row);
    currentTokenCount += 1;
    if (availableTokenCount < currentTokenCount) {
      slicedTable.push(currentSlice.join("\n"));
      currentSlice = [];
      currentTokenCount = 0;
      continue;
    }

    if (i === dataSection.length - 1) slicedTable.push(currentSlice.join("\n"));
  }

  return slicedTable.map((table) => headerSection.join("\n") + "\n" + table);
};

const translate = async (instructionData, inputData) => {
  const { organizationId, apiKey } = credentials;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "OpenAI-Organization": organizationId,
  };

  const payload = {
    model: "gpt-4",
    messages: [
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
  getTokenCount,
  sliceBasedOnTokenCount,
};
