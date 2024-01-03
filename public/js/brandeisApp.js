// Document ready function to ensure DOM is fully loaded before executing the script
$(document).ready(() => {
  // Handling click event for the modal button
  $("#modal-button").click(() => {
    console.log("Modal button clicked for events!");

    // Retrieving API token from data attribute
    let apiToken = $("#apiToken").data("token");
    console.log("API Token used for request:", apiToken);

    // Clearing modal body content
    $(".modal-body").html("");

    // Making a GET request to retrieve events using the API token
    $.get(`/api/events?apiToken=${apiToken}`, (results = {}) => {
      console.log("API response for events:", results);

      // Extracting events data from the API response
      let data = results.data;
      if (!data || !data.events) {
        console.log("No data or events found in API response.");
        return;
      }

      // Iterating through each event and updating the modal body
      data.events.forEach((event) => {
        console.log(`Event ID: ${event._id}, Title: ${event.title}, Joined Status: ${event.joined}`);
        $(".modal-body").append(
          `<div>
            <span class="event-title">${event.title}</span>
            <div class='event-description'>${event.description}</div>
            <button class='${event.joined ? "joined-button" : "join-button"}' data-id="${event._id}">
              ${event.joined ? "Joined" : "Join"}
            </button>
          </div>`
        );
      });
    }).then(() => {
      // Handling click event for the 'Join' button within the modal
      $(".join-button").click((event) => {
        let $button = $(event.target),
          eventId = $button.data("id");

        console.log("Join button clicked for event ID:", eventId);

        // Making a GET request to join the specified event
        $.get(`/api/events/${eventId}/join?apiToken=${apiToken}`, (results = {}) => {
          console.log(`Response from joining event ID ${eventId}:`, results);

          // Handling the response from the server after attempting to join the event
          let data = results.data;
          if (data && data.success) {
            // Updating the button text and class if the join operation is successful
            $button
              .text("Joined")
              .addClass("joined-button")
              .removeClass("join-button");
          } else {
            // Logging an error message if the join operation fails
            console.log("Joining event failed, trying again.");
            $button.text("Try again");
          }
        }).fail((jqXHR, textStatus, errorThrown) => {
          // Handling errors during the join operation
          console.error("Error joining event:", textStatus, errorThrown);
        });
      });
    });
  });
});

// Initializing a Socket.IO connection
const socket = io();

// Handling form submission to send a chat message via Socket.IO
$("#chatForm").submit(() => {
  let text = $("#chat-input").val(),
    userId = $("#chat-user-id").val(),
    userName = $("#chat-user-name").val();
  socket.emit("message", { content: text, userId: userId, userName: userName });

  // Clearing the input field after sending the message
  $("#chat-input").val("");
  return false;
});

// Handling incoming 'message' events from the Socket.IO server
socket.on("message", (message) => {
  // Displaying the received message and adding a visual effect to the chat icon
  displayMessage(message);
  for (let i = 0; i < 2; i++) {
    $(".chat-icon").fadeOut(200).fadeIn(200);
  }
});

// Handling incoming 'load all messages' events from the Socket.IO server
socket.on("load all messages", (data) => {
  // Displaying all messages received from the server
  data.forEach((message) => {
    displayMessage(message);
  });
});

// Handling 'user disconnected' events from the Socket.IO server
socket.on("user disconnected", () => {
  // Displaying a system message when a user leaves the chat
  displayMessage({
    userName: "Notice",
    content: "user left the chat",
  });
});

// Function to display a chat message in the UI
let displayMessage = (message) => {
  $("#chat").prepend(
    $("<li>").html(`${message.name} : <strong class="message ${getCurrentUserClass(message.user)}">${message.content}</strong>`)
  );
};

// Function to determine the CSS class for the current user's messages
let getCurrentUserClass = (id) => {
  let userId = $("#chat-user-id").val();
  return userId === id ? "current-user" : "other-user";
};
