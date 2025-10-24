// Note: Assumes Node.js v18+ for global fetch.
// If using older Node, run "npm install node-fetch" and add:
// import fetch from 'node-fetch';

export default class GoogleSheetAdapter {
  /**
   * @param {string} webAppUrl The deployed Google Apps Script URL.
   * @param {object} defaultData The default data to return if the db is empty.
   * @param {string} sheetName The name of the sheet (tab) to use for storage.
   */
  constructor(webAppUrl, defaultData = {}, sheetName = 'Sheet1') {
    this.url = webAppUrl;
    this.defaultData = defaultData;
    this.sheetName = sheetName;
  }

  /**
   * lowdb's read method.
   * Fetches the database JSON from the Google App Script (via GET).
   */
  async read() {
    try {
      const readUrl = new URL(this.url);
      readUrl.searchParams.set('sheetName', this.sheetName);

      const res = await fetch(readUrl.toString());
      if (!res.ok) {
        throw new Error(`Failed to read from Google Sheet: ${res.statusText}`);
      }
      const text = await res.text();
      // If cell is empty, Google Apps Script returns "{}"
      return JSON.parse(text);
    } catch (error) {
      console.error("Error reading from adapter:", error);
      // On failure, return the default data
      return this.defaultData;
    }
  }

  /**
   * lowdb's write method.
   * Sends the entire database JSON to the Google App Script (via POST).
   * @param {object} data The entire database object to write.
   */
  async write(data) {
    try {
      const writeUrl = new URL(this.url);
      writeUrl.searchParams.set('sheetName', this.sheetName);

      const res = await fetch(writeUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data, null, 2), // Pretty-print JSON
      });

      if (!res.ok) {
        throw new Error(`Failed to write to Google Sheet: ${res.statusText}`);
      }
      
      const responseJson = await res.json();
      if (responseJson.status !== 'success') {
         console.warn('Write operation reported non-success:', responseJson);
      }
      // lowdb's write method doesn't need to return anything
    } catch (error) {
      console.error("Error writing to adapter:", error);
    }
  }
}