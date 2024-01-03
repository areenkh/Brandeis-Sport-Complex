// Importing Mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const randToken = require("rand-token");

// Creating a Mongoose schema for the User model
const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "alumni"],
      default: "student",
    },
    graduationYear: {
      type: Number,
      required: true,
    },
    major: {
      type: String,
      required: true,
    },
    job: {
      type: String,
    },
    company: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipCode: {
      type: Number,
      min: 10000,
      max: 99999,
    },
    bio: {
      type: String,
    },
    interests: [{
      type: String,
    }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    apiToken: {
      type: String,
    },
    events: [{
      type: Schema.Types.ObjectId,
      ref: 'Event'
    }],
  },
  {
    timestamps: true,
  }
);

// Adding a virtual field to get the full name
userSchema.virtual("fullName").get(function () {
  return `${this.name}`;
});

userSchema.pre("save", function (next) {
  let user = this;
  if (!user.apiToken) {
    user.apiToken = randToken.generate(16);
    next();
  } else {
    next();
  }
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

// Exporting the User model
module.exports = mongoose.model("User", userSchema);
