// The sheet (tab) in your spreadsheet that will store the database.
const SHEET_NAME = "lowdb_storage";
// The cell where the entire JSON database string will be stored.
const CELL = "A1";

/**
 * Handles GET requests.
 * This is our "read" function. It returns the database JSON.
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: `Sheet named "${SHEET_NAME}" not found.` }))
      .setMimeType(ContentService.MimeType.JSON);
  }

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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: `Sheet named "${SHEET_NAME}" not found.` }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Get the new database string from the POST body
  const newData = e.postData.contents;

  // Overwrite the content of cell A1
  sheet.getRange(CELL).setValue(newData);

  // Return a success message
  return ContentService
    .createTextOutput(JSON.stringify({ status: "success", written: new Date() }))
    .setMimeType(ContentService.MimeType.JSON);
}