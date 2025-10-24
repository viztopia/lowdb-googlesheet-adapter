window.addEventListener('load', () => {
  let feed = document.querySelector('#feed');
  //STEP 6. Fetch all the messages from the server
  fetch('/messages')
    .then(response => {
      return response.json()
    })
    .then(data => {
      // console.log(data);
      //Step 7. Add messages to the page
      let messages = data.data;
      for (let i = 0; i < messages.length; i++) {
        console.log(messages[i]);
        let message = messages[i].message;
        let time = messages[i].time;
        let newMessage = document.createElement('p');
        let newMessageContent = time + ": " + message;
        newMessage.innerHTML = newMessageContent;

        //append to the feed
        feed.appendChild(newMessage);
      }
    })
    .catch(error => {
      console.log(error);
    });
});

//8. Listen for a new message and log it
let msg = document.querySelector("#msg-input");
let button = document.querySelector('#msg-submit');
button.addEventListener('click', () => {
  let msgValue = msg.value;
  // console.log(msgValue);

  //16. Clean the message input field
  msg.value = '';

  //Step 9.1 Create a message object
  let messageObject = {
    message: msgValue
  }

  //9.2. Stringify data
  messageObjectJSON = JSON.stringify(messageObject);

  //9.3. Create a POST request
  fetch('/new-message', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: messageObjectJSON
  })
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log(data);
      //15. Update the feed with a new message
      let message = data.message.message;
      let time = data.message.time;
      let newMessage = document.createElement('p');
      let newMessageContent = time + ": " + message;
      newMessage.innerHTML = newMessageContent;

      //append to the top of the feed
      feed.insertBefore(newMessage, feed.firstChild);
    })
    .catch(error => {
      console.log(error);
    });
});
