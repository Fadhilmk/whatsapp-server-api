const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const { GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID, VERIFY_TOKEN, PORT } = process.env;

let messagesByNumber = {};

// Webhook endpoint to receive messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    body.entry.forEach(async (entry) => {
      const receivedMessages = entry.messaging;

      if (receivedMessages && receivedMessages.length > 0) {
        const message = receivedMessages[0];
        const from = message.from; // Phone number of the sender
        const text = message.text && message.text.body ? message.text.body : ""; // Text of the received message

        console.log("Received message:", text);

        if (!messagesByNumber[from]) {
          messagesByNumber[from] = [];
        }

        // Store the received message
        messagesByNumber[from].push({ id: `${Date.now()}`, text, name: from, sent: false });

        // Mark the message as read
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          data: {
            messaging_product: "whatsapp",
            status: "read",
            message_id: message.id,
          },
        });

        console.log("Message marked as read");
      }
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
      url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to,
        text: { body: message }
      }
    });

    if (!messagesByNumber[to]) {
      messagesByNumber[to] = [];
    }

    // Store the sent message
    messagesByNumber[to].push({ id: `${Date.now()}`, text: message, name: 'You', sent: true });

    res.status(200).send('Message sent');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Failed to send message');
  }
});

// Serve the HTML files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT || 3000, () => {
  console.log(`Server is listening on port ${PORT || 3000}`);
});
