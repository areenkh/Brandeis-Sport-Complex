
// Importing required modules and controllers
const express = require("express");
const mongoose = require("mongoose");
const layouts = require("express-ejs-layouts");
const User = require("./models/user");
const methodOverride = require("method-override");
const connectFlash = require("connect-flash");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
const passport = require("passport");
const router = require("./routes/index");

// Creating an Express app
const app = express();

// Connecting to MongoDB database
mongoose.connect("mongodb://localhost:27017/Brandeis_SAA");
const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to the database!");
});

// Configuring the app
app.set("view engine", "ejs");
app.use(layouts);
app.use(express.static("public"));
app.set("port", process.env.PORT || 8080);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configuring method override
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);

// Configuring connect-flash, express-session, cookie-parser, and express-validator
app.use(connectFlash());
app.use(
  expressSession({
    secret: "secret_passcode",
    cookie: { maxAge: 4000000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser("secret_passcode"));
app.use(expressValidator({customValidators: {
  // ... custom validators ...
},}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Configuring flash messages
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// Setting up routes
app.use("/", router);

// Starting the server
const server = app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});

const io = require("socket.io")(server);
require("./controllers/chatController")(io);