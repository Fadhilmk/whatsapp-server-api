
// import express from "express";
// import axios from "axios";
// import bodyParser from "body-parser";

// const app = express();
// app.use(bodyParser.json());

// const { GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID, VERIFY_TOKEN, PORT } = process.env;

// // Webhook endpoint to receive messages
// app.post("/webhook", async (req, res) => {
//   try {
//     const { object, entry } = req.body;

//     if (object === "whatsapp_business_account") {
//       const changes = entry[0].changes[0];
//       const messages = changes.value.messages;
//       const contacts = changes.value.contacts;
//       const name = contacts && contacts[0] && contacts[0].profile && contacts[0].profile.name ? contacts[0].profile.name : "Customer";

//       if (messages && messages.length > 0) {
//         const message = messages[0];
//         const from = message.from; // Phone number of the sender
//         const messageId = message.id; // Message ID of the received message
//         const text = message.text && message.text.body ? message.text.body : ""; // Text of the received message

//         console.log("Received message:", text);

//         // Send an automatic reply
//         await axios({
//           method: "POST",
//           url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
//           headers: {
//             Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//           data: {
//             messaging_product: "whatsapp",
//             recipient_type: "individual",
//             to: from,
//             context: {
//               message_id: messageId,
//             },
//             type: "text",
//             text: {
//               preview_url: false,
//               body: `Thank you *${name}* for your message! We will get back to you shortly.`,
//             },
//           },
//         });

//         console.log("Reply sent successfully");
//       }
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     console.error("Error processing webhook:", error);
//     res.sendStatus(500);
//   }
// });

// // Endpoint for webhook verification
// app.get("/webhook", (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode && token) {
//     if (mode === "subscribe" && token === VERIFY_TOKEN) {
//       console.log("Webhook verified");
//       res.status(200).send(challenge);
//     } else {
//       res.sendStatus(403);
//     }
//   } else {
//     res.sendStatus(400);
//   }
// });

// const port = PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is listening on port: ${port}`);
// });

// import express from "express";
// import axios from "axios";
// import bodyParser from "body-parser";

// const app = express();
// app.use(bodyParser.json());

// const { GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID, VERIFY_TOKEN, PORT } = process.env;

// // Webhook endpoint to receive messages
// app.post("/webhook", async (req, res) => {
//   try {
//     const { object, entry } = req.body;

//     if (object === "whatsapp_business_account") {
//       const changes = entry[0].changes[0];
//       const messages = changes.value.messages;
//       const contacts = changes.value.contacts;
//       const name = contacts && contacts[0] && contacts[0].profile && contacts[0].profile.name ? contacts[0].profile.name : "Customer";

//       if (messages && messages.length > 0) {
//         const message = messages[0];
//         const from = message.from; // Phone number of the sender
//         const messageId = message.id; // Message ID of the received message
//         const text = message.text && message.text.body ? message.text.body : ""; // Text of the received message

//         console.log("Received message:", text);

//         // Mark the message as read
//         await axios({
//           method: "POST",
//           url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
//           headers: {
//             Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//           data: {
//             messaging_product: "whatsapp",
//             status: "read",
//             message_id: messageId,
//           },
//         });

//         console.log("Message marked as read");

//         // Send an automatic reply
//         await axios({
//           method: "POST",
//           url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
//           headers: {
//             Authorization: `Bearer ${GRAPH_API_TOKEN}`,
//             "Content-Type": "application/json",
//           },
//           data: {
//             messaging_product: "whatsapp",
//             recipient_type: "individual",
//             to: from,
//             context: {
//               message_id: messageId,
//             },
//             type: "text",
//             text: {
//               preview_url: false,
//               body: `Thank you *${name}* for your message! We will get back to you shortly.`,
//             },
//           },
//         });

//         console.log("Reply sent successfully");
//       }
//     }

//     res.sendStatus(200);
//   } catch (error) {
//     console.error("Error processing webhook:", error);
//     res.sendStatus(500);
//   }
// });

// // Endpoint for webhook verification
// app.get("/webhook", (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode && token) {
//     if (mode === "subscribe" && token === VERIFY_TOKEN) {
//       console.log("Webhook verified");
//       res.status(200).send(challenge);
//     } else {
//       res.sendStatus(403);
//     }
//   } else {
//     res.sendStatus(400);
//   }
// });

// const port = PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server is listening on port: ${port}`);
// });



const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

const { GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID, VERIFY_TOKEN, PORT } = process.env;

// Endpoint to send a message
app.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Recipient phone number and message text are required' });
    }

    // Send the message
    await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      },
    });

    console.log(`Message sent to ${to}: ${message}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Webhook endpoint to receive messages (no changes needed)
// ...

// Endpoint for webhook verification (no changes needed)
// ...

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
