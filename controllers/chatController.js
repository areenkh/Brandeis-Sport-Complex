// Importing the 'Message' model to interact with the database
const Message = require("../models/message");

// Exporting a function that takes the 'io' (Socket.IO) instance as a parameter
module.exports = (io) => {
  // Handling socket connection event
  io.on("connection", (client) => {
    console.log("new connection");

    // Handling socket disconnection event
    client.on("disconnect", () => {
      // Broadcasting a message to all clients about the disconnected user
      client.broadcast.emit("user disconnected");
      console.log("user disconnected");
    });

    // Handling incoming 'message' event from a client
    client.on("message", (data) => {
      // Extracting message attributes from the received data
      let messageAttributes = {
        content: data.content,
        name: data.userName,
        user: data.userId,
      };

      // Creating a new 'Message' instance with the extracted attributes
      let m = new Message(messageAttributes);

      // Saving the message to the database
      m.save()
        .then(() => {
          // Emitting the 'message' event to all clients with the message attributes
          io.emit("message", messageAttributes);
        })
        .catch((error) => {
          // Logging an error message if there's an issue with saving the message
          console.log(`error: ${error.message}`);
        });
    });

    // Retrieving the latest 10 messages from the database and emitting them to the connecting client
    Message.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .then((messages) => {
        // Reversing the order of messages and emitting them to the connecting client
        client.emit("load all messages", messages.reverse());
      });
  });
};
