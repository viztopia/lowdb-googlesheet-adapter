// Note: Assumes Node.js v18+ for global fetch.
// If using older Node, run "npm install node-fetch" and add:
// import fetch from 'node-fetch';

export default class GoogleSheetAdapter {
  /**
   * @param {string} webAppUrl The deployed Google Apps Script URL.
   * @param {object} defaultData The default data to return if the db is empty.
   */
  constructor(webAppUrl, defaultData = {}) {
    this.url = webAppUrl;
    this.defaultData = defaultData;
  }

  /**
   * lowdb's read method.
   * Fetches the database JSON from the Google App Script (via GET).
   */
  async read() {
    try {
      const res = await fetch(this.url);
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
      const res = await fetch(this.url, {
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