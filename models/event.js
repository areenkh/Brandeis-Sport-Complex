
// Importing the User model
const User = require("./user");
// Importing Mongoose
const mongoose = require("mongoose");

// Defining the schema for the Event model
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },            // Title of the event
  description: { type: String, required: true },      // Description of the event
  location: { type: String, required: true },         // Location of the event
  startDate: { type: Date, required: true },          // Start date of the event
  endDate: { type: Date, required: true },            // End date of the event
  isOnline: { type: Boolean, default: false },        // Flag indicating if the event is online
  registrationlink: { type: String },                 // Link for event registration
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },                                                  // Organizer of the event (referenced from the User model)
  attendees: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],                                                  // List of attendees (referenced from the User model)
});

// Exporting the Event model
module.exports = mongoose.model('Event', eventSchema);
