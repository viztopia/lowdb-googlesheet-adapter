import express from 'express';
import { Low } from 'lowdb';
import GoogleSheetAdapter from './GoogleSheetAdapter.js'; // Adjust path if needed

// 1. SET UP YOUR ADAPTER
const WEB_APP_URL = "PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE";
const defaultData = { messages: [] };

// Use the default 'Sheet1' sheet
const adapter = new GoogleSheetAdapter(WEB_APP_URL, defaultData);

// Or, specify a custom sheet name
// const adapter = new GoogleSheetAdapter(WEB_APP_URL, defaultData, 'my_lowdb_sheet');

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