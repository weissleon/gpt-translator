const ExcelJS = require("exceljs");
const { config } = require("./config-handler");
const createNewWorkbook = () => new ExcelJS.Workbook();

const loadWorkbook = async (filePath) => {
  return await createNewWorkbook().xlsx.readFile(filePath);
};

const verifyWorkbook = (workbook) => {
  const { requiredSheets, requiredFields } = config;

  const worksheets = workbook.worksheets;

  const sheetCount = requiredSheets.length;
  let currentSheetCount = 0;

  for (let i = 0; i < worksheets.length; i++) {
    const ws = worksheets[i];
    const wsName = ws.name;
    if (!requiredSheets.includes(wsName)) continue;

    currentSheetCount++;

    const headers = ws.getRow(1).values.slice(1);
    const validHeaders = new Set(requiredFields[wsName]);
    const headerCount = validHeaders.size;
    let currentHeaderCount = 0;

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (validHeaders.has(header)) currentHeaderCount++;
    }
    if (headerCount !== currentHeaderCount) return false;
  }
  if (sheetCount !== currentSheetCount) return false;

  return true;
};

const getAllRows = (worksheet) => {
  const rowCount = worksheet.rowCount;

  if (rowCount === 1) return [];

  return worksheet
    .getRows(2, rowCount)
    .filter((row) => row.values.length !== 0)
    .map((row) => {
      return stringifyRow(row.values.slice(1));
    });
};

const stringifyRow = (row) => {
  return row.map((cell) => {
    let finalCell = cell;
    if (typeof cell === "object") {
      if (cell["result"] !== undefined) finalCell = cell["result"];
      else if (cell["richText"] !== undefined) {
        let extractedText = "";
        cell["richText"].forEach((data) => (extractedText += data["text"]));
        finalCell = extractedText;
      } else finalCell = cell["text"];
    }

    if (finalCell !== undefined) {
      finalCell = finalCell
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
    }
    return finalCell;
  });
};

const getHeader = (worksheet) => {
  return stringifyRow(worksheet.getRow(1).values.slice(1));
};

const verifyData = (workbook) => {
  for (let i = 0; i < workbook.worksheets.length; i++) {
    const worksheet = workbook.worksheets[i];
    const headerLength = getHeader(worksheet).length;
    const rows = getAllRows(worksheet);
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      if (headerLength - row.length > 1) return false;
      for (let k = 0; k < row.length; k++) {
        const cell = row[k];
        if (cell === undefined && k !== row.length - 1) return false;
      }
    }
  }
  return true;
};

const convertToArr = (worksheet) => {
  return [getHeader(worksheet), ...getAllRows(worksheet)];
};

const convertToMarkdownTable = (arrData, exludeLast = false) => {
  if (arrData.length <= 1) return "";
  const headers = stringifyRow(arrData[0]);

  let table = "";

  for (let i = 0; i < headers.length - (exludeLast ? 1 : 0); i++) {
    const header = headers[i];
    table += `| ${header} ${
      i === headers.length - (exludeLast ? 2 : 1) ? "|\n" : ""
    }`;
  }

  for (let i = 0; i < headers.length - (exludeLast ? 1 : 0); i++) {
    table += `| --- ${
      i === headers.length - (exludeLast ? 2 : 1) ? "|\n" : ""
    }`;
  }

  for (let i = 1; i < arrData.length; i++) {
    const row = arrData[i];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      table += `| ${cell} ${
        j === row.length - 1 ? `|${i === arrData.length - 1 ? "" : "\n"}` : ""
      }`;
    }
  }

  return table;
};
const convertToExcelTable = (mdTable) => {
  const rows = mdTable.split(/\r?\n|\r/g).filter((row) => row !== "");

  const data = [];
  for (let i = 0; i < rows.length; i++) {
    const rowArr = rows[i]
      .split(/\s*\|\s*/g)
      .filter((cell) => cell !== "")
      .map((cell) =>
        cell.replace(/\\r/g, "\r").replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
      );
    if (i !== 1) data.push(rowArr);
  }

  return data;
};

const filterReference = (worksheet) => {
  const headers = getHeader(worksheet);

  const rows = getAllRows(worksheet);

  const reference = [];
  const data = [];

  reference.push([...headers]);
  data.push([...headers]);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row[5] === undefined) data.push([i + 2, row]);
    else reference.push([i + 2, row]);
  }

  return [reference, data];
};

module.exports = {
  createNewWorkbook,
  loadWorkbook,
  verifyWorkbook,
  verifyData,
  convertToMarkdownTable,
  convertToExcelTable,
  filterReference,
  getAllRows,
  getHeader,
};
