const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const GRAPH_API_TOKEN = 'EAAYbZBkW0wTYBOx3pShttZBVmMW4kv6ZCKLLAZBRzYy2hrh1fmLR9kwKp2cyQwwCijptgOxdG6HElWRnQiVIMjZCW5atpGru8YZBUZBZB0cFkfCNqWwXV4WsyQb0VXevpbNRZBP2ZBZA7zpna1eS5PhMbRkQ4ACaZADP8ZBehTKWa1i0H13ylxXqD6oWT4z4OD4mlyB1kjrnin9ZCpkA7FdlDtziUAbUftSdbuDg1z2Qn8XRwC3XYZD';
const BUSINESS_PHONE_NUMBER_ID = 'EAAYbZBkW0wTYBOx3pShttZBVmMW4kv6ZCKLLAZBRzYy2hrh1fmLR9kwKp2cyQwwCijptgOxdG6HElWRnQiVIMjZCW5atpGru8YZBUZBZB0cFkfCNqWwXV4WsyQb0VXevpbNRZBP2ZBZA7zpna1eS5PhMbRkQ4ACaZADP8ZBehTKWa1i0H13ylxXqD6oWT4z4OD4mlyB1kjrnin9ZCpkA7FdlDtziUAbUftSdbuDg1z2Qn8XRwC3XYZD';
const PORT=3000;

let messagesByNumber = {};

// Webhook endpoint to receive messages
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object) {
    body.entry.forEach(entry => {
      const message = entry.changes[0].value.messages[0];
      const from = message.from; // Phone number of the sender
      const text = message.text.body; // Text of the received message

      if (!messagesByNumber[from]) {
        messagesByNumber[from] = [];
      }

      // Store the received message
      messagesByNumber[from].push({ id: Date.now(), text, from, sent: false });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Endpoint to fetch all messages grouped by phone number
app.get('/messages', (req, res) => {
  res.json(messagesByNumber);
});

// Endpoint to fetch messages for a specific phone number
app.get('/messages/:number', (req, res) => {
  const { number } = req.params;
  res.json(messagesByNumber[number] || []);
});

// Endpoint to send a message
app.post('/send', async (req, res) => {
  const { to, message } = req.body;

  try {
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v15.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        to,
        text: { body: message },
      },
    });

    if (!messagesByNumber[to]) {
      messagesByNumber[to] = [];
    }

    // Store the sent message
    messagesByNumber[to].push({ id: Date.now(), text: message, from: 'You', sent: true });

    res.status(200).send('Message sent');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Failed to send message');
  }
});

// Serve the HTML files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
