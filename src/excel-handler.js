const ExcelJS = require("exceljs");

const createNewWorkbook = () => new ExcelJS.Workbook();

const loadWorkbook = async (filePath) => {
  await createNewWorkbook().xlsx.readFile(filePath);
};

module.exports = {
  createNewWorkbook,
  loadWorkbook,
};
