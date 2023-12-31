const { checkIfFileExists, exportExcelFile } = require("./src/fs-handler");
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

const path = require("path");

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

  let currentIdx = 0;
  const translationWithIdx = [];
  for (let i = 0; i < slicedDataTable.length; i++) {
    const dataChunk = slicedDataTable[i];

    console.log("Requesting");
    console.log(`Token Count: ${getTokenCount(dataChunk)}`);
    const translationMdTable = await translate(instruction, dataChunk);
    const translationArray = convertToExcelTable(translationMdTable);
    translationArray.shift();

    for (let j = 0; j < translationArray.length; j++) {
      const translation = translationArray[j][0];
      translationWithIdx.push([dataIndices[currentIdx], translation]);
      currentIdx++;
    }
  }

  for (let i = 0; i < translationWithIdx.length; i++) {
    const [idx, translation] = translationWithIdx[i];
    const ws = workbook.getWorksheet("data");
    ws.getCell(idx, ws.columnCount).value = translation;
  }

  console.log("Exporting...");
  const outputFile = path.basename(filePath).split(".")[0];
  const exportFilePath = await exportExcelFile(workbook, outputFile);

  console.log(`File Exported to "${exportFilePath}"`);
};

run();
