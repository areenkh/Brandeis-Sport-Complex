// Importing the User model and the passport package
const User = require("../models/user");
const passport = require("passport");
const token = process.env.TOKEN || "kitchent0k3n";


// Function to extract relevant user parameters from the request body
const getUserParams = (body) => {
  return {
    name: body.name,
    email: body.email,
    password: body.password,
    zipCode: body.zipCode,
    role: body.role,
    graduationYear: body.graduationYear,
    major: body.major,
    job: body.job,
    company: body.company,
    city: body.city,
    state: body.state,
    country: body.country,
    bio: body.bio,
    interests: body.interests,
  };
};

// Exporting the users controller methods
module.exports = {
  // Index method to fetch all users
  index: (req, res, next) => {
    User.find()
      .then((users) => {
        res.locals.users = users;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching users: ${error.message}`);
        next(error);
      });
  },

  // Render the index view with the users
  indexView: (req, res) => {
    res.render("users/index");
  },

  // Render the form for creating a new user
  new: (req, res) => {
    res.render("users/new");
  },

  // Create a new user
  create: (req, res, next) => {
    if (req.skip) next();
    let newUser = new User(getUserParams(req.body));
    User.register(newUser, req.body.password, (error, user) => {
      if (user) {
        req.flash("success", `${user.name}'s account created successfully!`);
        res.locals.redirect = "/users";
        next();
      } else {
        req.flash(
          "error",
          `Failed to create user account because:${error.message}.`
        );
        res.locals.redirect = "/users/new";
        next();
      }
    });
  },

  // Redirect middleware
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // Show a specific user and its details
  show: (req, res, next) => {
    let userId = req.params.id;
    User.findById(userId)
      .then((user) => {
        if (!user) {
          req.flash("error", "User not found.");
          res.locals.redirect = "/users";
        } else {
          res.locals.user = user;
        }
        next();
      })
      .catch((error) => {
        console.log(`Error fetching user by ID: ${error.message}`);
        req.flash("error", "Failed to fetch user data.");
        next(error);
      });
  },

  // Render the show view with user details
  showView: (req, res) => {
    res.render("users/show");
  },

  // Render the form for editing a specific user
  edit: (req, res, next) => {
    let userId = req.params.id;
    User.findById(userId)
      .then((user) => {
        res.render("users/edit", { user: user });
      })
      .catch((error) => {
        console.log(`Error fetching user by ID: ${error.message}`);
        req.flash("error", "Failed to fetch user data.");
        next(error);
      });
  },

  // Update a specific user
  update: (req, res, next) => {
    console.log("heyyy");
    let userId = req.params.id,
      userParams = getUserParams(req.body);
    User.findByIdAndUpdate(userId, {
      $set: userParams,
    })
      .then((user) => {
        req.flash(
          "success",
          `${user.name}'s information updated successfully!`
        );
        res.locals.redirect = `/users/${userId}`;
        res.locals.user = user;
        next();
      })
      .catch((error) => {
        console.log(`Error updating user by ID: ${error.message}`);
        req.flash(
          "error",
          `Failed to update user information: ${error.message}`
        );
        res.locals.redirect = `/users/${userId}/edit`;
        next();
      });
  },

  // Delete a specific user
  delete: (req, res, next) => {
    console.log("deleted");

    let userId = req.params.id;
    User.findByIdAndDelete({ _id: userId })
      .then(() => {
        req.flash("success", "User deleted successfully!");
        res.locals.redirect = "/users";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting user by ID: ${error.message}`);
        req.flash("error", "Failed to delete user: " + error.message);
        next();
      });
  },
  login: (req, res) => {
    res.render ("users/login");
  },
  authenticate: passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: "Failed to login.",
    successRedirect: "/",
  }),
  validate: (req, res, next) => {
    req
      .sanitizeBody("emails")
      .normalizeEmail({
        all_lowercase: true,
      })
      .trim();
    req.check("email", "Email is invalid").isEmail();
    req
      .check("zipCode", "Zip code is invalid")
      .notEmpty()
      .isInt()
      .isLength({
        min: 5,
        max: 5,
      })
      .equals(req.body.zipCode);
    req.check("password", "Password cannot be empty").notEmpty();
    req.getValidationResult().then((error) => {
      if (!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/users/new";
        next();
      } else {
        next();
      }
    });
  },
  logout: (req, res, next) => {
    req.logout((err)=> {
      if (err) {
        return next(err);
      }
    })
    req.flash("success", `You have been logged out!`);
    res.locals.redirect = "/";
    next();
  },
  ensureLoggedIn : (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "You need to be logged in to access this page");
    res.redirect("/users/login"); 
  },
  verifyToken: (req, res, next) => {
    let token = req.query.apiToken;

    if (token) {
      User.findOne({ apiToken: token })
        .then((user) => {
          if (user) next();
          else next(new Error("Invalid API token"));
        })
        .catch((error) => {
          next(new Error(error.message));
        });
    } else next(new Error("Invalid API token"));
  },
};