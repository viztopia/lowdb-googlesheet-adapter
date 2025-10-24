// The default sheet (tab) to use if none is specified in the request.
const DEFAULT_SHEET_NAME = "Sheet1";
// The cell where the entire JSON database string will be stored.
const CELL = "A1";

/**
 * A helper function to get a sheet by name, or create it if it doesn't exist.
 * @param {Spreadsheet} ss The active spreadsheet.
 * @param {string} sheetName The name of the sheet to get or create.
 * @returns {Sheet} The Google Sheet object.
 */
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Handles GET requests.
 * This is our "read" function. It returns the database JSON.
 */
function doGet(e) {
  // Get sheet name from URL parameter, or use the default.
  const sheetName = e.parameter.sheetName || DEFAULT_SHEET_NAME;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, sheetName);

  // Get the value from cell A1.
  const data = sheet.getRange(CELL).getValue();
  // If the cell is empty, return a default empty object string.
  const jsonOutput = data || "{}"; 

  return ContentService
    .createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles POST requests.
 * This is our "write" function. It overwrites the database JSON.
 */
function doPost(e) {
  // Get sheet name from URL parameter, or use the default.
  const sheetName = e.parameter.sheetName || DEFAULT_SHEET_NAME;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet(ss, sheetName);

  // Get the new database string from the POST body
  const newData = e.postData.contents;

  // Overwrite the content of cell A1
  sheet.getRange(CELL).setValue(newData);

  // Return a success message
  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", written: new Date() }))
    .setMimeType(ContentService.MimeType.JSON);
}