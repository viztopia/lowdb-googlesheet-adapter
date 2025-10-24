# Lowdb Adapter for Google Sheets

Use a Google Sheet as a free, simple JSON database for your `lowdb` projects.

This repository provides a custom `lowdb` (v5+) adapter that reads and writes your entire database state to a **single cell** in a Google Sheet. It uses a Google Apps Script as a simple, secure API.

This is perfect for small projects, prototypes, or internal tools where you need a persistent, shareable database without setting up a full server.

## How It Works

This adapter treats a single cell in your Google Sheet (e.g., `A1`) as if it were a `db.json` file.

  * `db.read()`: Sends an HTTP `GET` request to your Google Apps Script, which returns the JSON string from the cell.
  * `db.write()`: Sends an HTTP `POST` request with the new JSON string, which your Google Apps Script uses to overwrite the cell's content.

**Architecture:**
`Your App (Node.js/Browser)` ↔ `Google Apps Script URL` ↔ `Google Sheet Cell`

## Files in this Repo

  * **`lowdb_adapter.gs`**: The **backend** code. You will paste this into your Google Apps Script project.
  * **`GoogleSheetAdapter.js`**: The **client/server** code. You import this class into your Node.js or browser-based project.
  * **`/example/index.js`**: A complete, working Node.js Express server example showing how to use the adapter.
  * **`/example/public`**: The frontend code for the example server, demonstrating how to interact with the database via HTTP requests.

-----

## 🚀 Setup Instructions (in 2 Parts)

Follow these steps carefully to get everything running.

### Part 1: Google Sheet & Apps Script (The "Backend")

This part creates the secure web API that your adapter will talk to.

1.  **Create the Sheet:**

      * Go to [sheets.new](https://sheets.new) to create a new Google Sheet. (You may want to use a dummy Google account instead of your main account for security).
      * At the bottom, rename the default "Sheet1" tab to **`lowdb_storage`**. (If you want to use a different name, you must change the `SHEET_NAME` variable in the `lowdb_adapter.gs` script).

2.  **Create the Apps Script:**

      * In your new spreadsheet, click **Extensions** \> **Apps Script**.
      * Delete any placeholder code in the `Code.gs` file.
      * Copy the entire contents of **`lowdb_adapter.gs`** from this repository and paste it into the script editor.

3.  **Deploy the Script:**

      * Click the **Deploy** button (top right) and select **New deployment**.
      * Click the **Gear Icon** (⚙️) next to "Select type" and choose **Web app**.
      * Fill in the deployment configuration:
          * **Description:** `LowDB Adapter` (or anything you want).
          * **Execute as:** **Me**. (This is critical).
          * **Who has access:** **Anyone**. (This is also critical. It makes your API public).
      * Click **Deploy**.

4.  **Authorize & Get URL:**

      * Google will ask you to **Authorize access**.
      * Choose your Google account.
      * Click **"Advanced"**, then **"Go to [Your Script Name] (unsafe)"**.
      * Click **"Allow"** to grant the script permission to edit your sheet.
      * Once deployed, you will be given a **Web app URL**. **Copy this URL.** This is your database API key.

### Part 2: Your Node.js Project (The "Client")

This part shows how to use the adapter in your own code.

1.  **Install `lowdb`:**

    ```bash
    npm install lowdb
    ```

2.  **Copy the Adapter:**

      * Copy the **`GoogleSheetAdapter.js`** file into your project directory. It should be in the same folder as your main code file (e.g., `index.js`).

3.  **Use it in Your Code:**

      * See the **`/example/index.js`** file for a complete, working example.
      * The core logic is to import `Low` and your new adapter, then initialize it with the URL you copied.

-----

## Usage Example

This is the server code `/example/index.js` file, showing how to set up `lowdb` using the Google Sheet Adapter.


```javascript
import express from 'express';
import { Low } from 'lowdb';
import GoogleSheetAdapter from './GoogleSheetAdapter.js'; // Adjust path if needed

// 1. SET UP YOUR ADAPTER
const WEB_APP_URL = "PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE";
const defaultData = { messages: [] };
const adapter = new GoogleSheetAdapter(WEB_APP_URL, defaultData);
const db = new Low(adapter, defaultData);

// 2. READ THE DATABASE ON STARTUP
await db.read();

// 3. !! CRITICAL !!
// Ensure the default structure exists, even if the sheet was empty.
// This prevents "Cannot read properties of undefined (reading 'push')"
db.data = db.data || defaultData;
db.data.messages = db.data.messages || [];

// 4. SET UP YOUR SERVER
let app = express();
app.use(express.static('public'));
app.use(express.json());


/*ROUTES */
app.get('/messages', (request, response) => {
  // Always read on GET to fetch the latest data
  db.read()
    .then(() => {
      
      db.data.messages = db.data.messages || []; // Add a safety check here
      
      let messagesData = {
        data: db.data.messages
      }
      response.json(messagesData);
    })
});

app.post('/new-message', (request, response) => {

  let messageData = request.body;
  messageData.time = Date();

  let messageObject = {
    task: "success",
    message: messageData
  };

  // This is now safe because of Fix #1
  db.data.messages.push(messageData);
  
  // Write the new data back to Google Sheets
  db.write()
    .then(() => {
      response.json(messageObject);
    })
});

// 5. START THE SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on localhost:${port}`);
});
```

-----

## 🚨 Important Notes & Troubleshooting

  * **Error: `TypeError: Cannot read properties of undefined (reading 'push')`**

      * This is the most common error. It means your `db.data` object is `{}` because the sheet was empty, so `db.data.messages` is `undefined`.
      * **Fix:** Always add the "safety check" lines after your initial `await db.read()` to ensure your default data structure is in place (see Step 3 in the example).

  * **My Code Isn't Saving / I Get an Error\!**

      * If you make **any** changes to the `lowdb_adapter.gs` file, you **must re-deploy it**.
      * **How to Re-deploy:** Click **Deploy** \> **Manage deployments** \> Click the **Edit (pencil ✏️) icon** \> Change **Version** to **New version** \> Click **Deploy**. You do not get a new URL.

  * **Is This Secure?**

      * Setting **Who has access: Anyone** means *anyone* on the internet who finds your Web app URL can read and write to your database.
      * This is fine for class projects, prototypes, or non-sensitive data.
      * **DO NOT** store passwords, API keys, or private user data here.