
// Importing Mongoose
const mongoose = require("mongoose");
// Importing the User model
const User = require("./user");

// Creating a Mongoose schema for the Job model
const jobSchema = mongoose.Schema({
  title: { type: String, required: true },            // Title of the job
  company: { type: String, required: true },          // Company offering the job
  location: { type: String, required: true },         // Location of the job
  description: { type: String, required: true },      // Description of the job
  requirements: { type: String, required: true },     // Requirements for the job
  salary: { type: Number, required: true },           // Salary for the job
  contactEmail: { type: String, required: true },     // Contact email for the job
  contactPhone: { type: String, required: true },     // Contact phone for the job
  postDate: { type: Date, default: Date.now },       // Date when the job was posted
  deadlineDate: { type: Date, required: true },      // Deadline date for applying to the job
  isActive: { type: Boolean, default: true },        // Flag indicating if the job is active
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Exporting the Job model
module.exports = mongoose.model("Job", jobSchema);
