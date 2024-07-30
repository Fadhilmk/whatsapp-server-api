// const express=require("express")
// const body_parser=require("body-parser")
// const axios=require("axios")
// const app=express().use(body_parser.json());
// require('dotenv').config();

// const token=process.env.TOKEN
// const mytoken=process.env.MYTOKEN

// app.listen(process.env.PORT,()=>{
//     console.log("webhook listening");
// })

// app.get("/webhook",(req,res)=>{
//     let mode=req.query["hub.mode"];
//     let challenge=req.query["hub.challenge"];
//     let token=req.query["hub.verify_token"]

//     if(mode==="subscribe" && token===mytoken){
//         res.status(200).send(challenge)
//     }
//     else{
//         res.status(403);
//     }
// })
// app.post("/webhook",(req,res)=>{
//     let body_param=req.body;
//     console.log(JSON.stringify(body_param,null,2))

//     if(body_param.object){
//         if(body_param.entry && 
//             body_param.entry[0].changes && 
//             body_param.entry[0].changes[0].value.messages &&
//             body_param.entry[0].changes[0].value.messages[0]
//         ){
//             let phone_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
//             let from=body_param.entry[0].changes[0].value.messages[0].from;
//             let msg_body=body_param.entry[0].changes[0].value.messages[0].text.body;

//             axios({
//                 method:"POST",
//                 url:"https://graph.facebook.com/v20.0/"+phone_no_id+"/messages?access_token="+token,
//                 data:{
//                     messaging_product:"whatsapp",
//                     to:from,
//                     text:{
//                         body:"Hey Buddy This is a Reply message...."
//                     }
//                 },
//                 headers:{
//                     "Content-Type":"application/json"
//                 }

//             })
//             res.sendStatus(200)
//         }else{
//             res.sendStatus(404)
//         }
//     }
// })

// app.get("/",(req,res)=>{
//     res.status(200).send("hello this is api")
// })


import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const { GRAPH_API_TOKEN, BUSINESS_PHONE_NUMBER_ID, VERIFY_TOKEN, PORT } = process.env;

// Webhook endpoint to receive messages
app.post("/webhook", async (req, res) => {
  try {
    const { object, entry } = req.body;

    if (object === "whatsapp_business_account") {
      const changes = entry[0].changes[0];
      const messages = changes.value.messages;
      const contacts = changes.value.contacts;
      const name = contacts && contacts[0] && contacts[0].profile && contacts[0].profile.name ? contacts[0].profile.name : "Customer";

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from; // Phone number of the sender
        const messageId = message.id; // Message ID of the received message
        const text = message.text && message.text.body ? message.text.body : ""; // Text of the received message

        console.log("Received message:", text);

        // Send an automatic reply
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v20.0/${BUSINESS_PHONE_NUMBER_ID}/messages`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            context: {
              message_id: messageId,
            },
            type: "text",
            text: {
              preview_url: false,
              body: `Thank you *${name}* for your message! We will get back to you shortly.`,
            },
          },
        });

        console.log("Reply sent successfully");
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Endpoint for webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

const port = PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});

