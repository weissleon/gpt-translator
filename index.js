const { checkIfFileExists } = require("./src/fs-handler");
const {
  translate,
  getTokenCount,
  sliceBasedOnTokenCount,
} = require("./src/openai-api-handler");
const { config } = require("./src/config-handler");
const {
  showWelcomeMessage,
  showFilePathInputMessage,
  showExitMessage,
} = require("./src/ui-handler");
const {
  loadWorkbook,
  verifyWorkbook,
  verifyData,
  convertToMarkdownTable,
  convertToExcelTable,
  filterReference,
  getAllRows,
  getHeader,
} = require("./src/excel-handler");

const run = async () => {
  showWelcomeMessage();

  const filePath = await showFilePathInputMessage(
    (filePath) => checkIfFileExists(filePath) || "Please recheck the file path"
  );
  if (filePath === undefined) process.exit(1);

  const workbook = await loadWorkbook(filePath);

  const isWorkbookValid = verifyWorkbook(workbook);
  if (!isWorkbookValid) return showExitMessage("Invalid Workbook Format!");

  const isDataValid = verifyData(workbook);
  if (!isDataValid) return showExitMessage("There are empty data in the file!");

  const [reference, data] = filterReference(workbook.getWorksheet("data"));

  const referenceIndices = reference.map((rowPair) => rowPair[0]);
  referenceIndices.shift();
  const dataIndices = data.map((rowPair) => rowPair[0]);
  dataIndices.shift();

  const referenceSlice = reference.map((rowPair, index) =>
    index !== 0 ? rowPair[1] : rowPair
  );
  const dataSlice = data.map((rowPair, index) =>
    index !== 0 ? rowPair[1] : rowPair
  );

  const referenceMdTable = convertToMarkdownTable(referenceSlice);
  const dataMdTable = convertToMarkdownTable(dataSlice, true);

  const glossaryHeader = getHeader(workbook.getWorksheet("glossary"));
  const glossaryData = getAllRows(workbook.getWorksheet("glossary"));
  const glossaryMdTable = convertToMarkdownTable([
    glossaryHeader,
    ...glossaryData,
  ]);

  const glossaryTokenCount = getTokenCount(glossaryMdTable);
  const instructionTemplate = config["instruction"] + "\n```\n";
  const instructionTemplateTokenCount = getTokenCount(instructionTemplate);

  const { instruction: instructionMaxTokenCount, input: inputMaxTokenCount } =
    config["maxTokenCount"];
  const availableInstructionTokenCount =
    instructionMaxTokenCount -
    instructionTemplateTokenCount -
    glossaryTokenCount;

  console.log(`available token count: ${availableInstructionTokenCount}`);

  const slicedRefTable = sliceBasedOnTokenCount(
    referenceMdTable,
    availableInstructionTokenCount
  );

  const instruction =
    instructionTemplate + slicedRefTable[0] + `\n\n${glossaryMdTable}`;

  const slicedDataTable = sliceBasedOnTokenCount(
    dataMdTable,
    inputMaxTokenCount
  );

  console.log(referenceIndices);
  console.log(dataIndices);

  for (let i = 0; i < slicedDataTable.length; i++) {
    const dataChunk = slicedDataTable[i];

    console.log("Requesting");
    const result = await translate(instruction, dataChunk);

    console.log(result);
  }
  // const finalData = convertToExcelTable(dataMdTable);
  //   await workbook.xlsx.writeFile("out.xlsx");
};

run();
