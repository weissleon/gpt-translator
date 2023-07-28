const { checkIfFileExists } = require("./src/fs-handler");
const { translate } = require("./src/openai-api-handler");
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

  const referenceTable = convertToMarkdownTable(referenceSlice);
  const dataMdTable = convertToMarkdownTable(dataSlice, true);

  const glossayHeader = [...workbook.getWorksheet("glossary").getRow(1).values];
  glossayHeader.shift();
  const glossaryData = getAllRows(workbook.getWorksheet("glossary")).map(
    (row) => {
      row.shift();
      return row;
    }
  );
  const glossaryMdTable = convertToMarkdownTable([
    glossayHeader,
    ...glossaryData,
  ]);

  //   console.log("data");
  //   console.log(dataMdTable);
  //   console.log("ref");
  //   console.log(referenceTable);
  //   console.log("glossary");
  //   console.log(glossaryMdTable);

  const instruction =
    config["instruction"] + "```\n" + referenceTable + "\n\n" + glossaryMdTable;
  console.log(instruction);
  //   console.log(finalData);
  //   await translate("hi");

  const finalData = convertToExcelTable(dataMdTable);
  //   await workbook.xlsx.writeFile("out.xlsx");
};

run();
