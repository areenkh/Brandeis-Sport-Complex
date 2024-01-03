// Importing the Event and User models
const Event = require("../models/event");
const httpStatus = require("http-status-codes");
const User = require("../models/user");
const { ensureLoggedIn } = require("./usersController");
// const middleware=("./usersController")

// Function to extract relevant event parameters from the request body
const getEventParams = (body) => {
  return {
    title: body.title,
    description: body.description,
    location: body.location,
    startDate: body.startDate,
    endDate: body.endDate,
    isOnline: body.isOnline === "on",
    registrationlink: body.registrationlink,
    organizer: body.organizer,
    attendees: body.attendees || [],
  };
};

// Exporting the events controller methods
module.exports = {
  // Index method to fetch all events
  index: (req, res, next) => {
    Event.find()
      .populate("organizer")
      // .populate("attendees")
      .exec()
      .then((events) => {
        res.locals.events = events;

        // Fetching a single user
        User.findOne({})
          .then((user) => {
            res.locals.user = user;
            next();
          })
          .catch((error) => {
            console.log(`Error fetching user: ${error.message}`);
            next(error);
          });
      })
      .catch((error) => {
        console.log(`Error fetching events: ${error.message}`);
        next(error);
      });
  },

  // Render the index view with the events and user data
  indexView: (req, res) => {
    // res.render("events/index", {
    //   user: res.locals.user,
    //   events: res.locals.events,
    // });

    if (req.query.format === "json") {
      res.json(res.locals.event);
    } else {
      res.render("events/index", {
        user: res.locals.user,
        events: res.locals.events,
      });
    }

  },

  // Render the form for creating a new event
  new: [
    ensureLoggedIn,
    (req, res) => {
      User.find()
        .then((users) => {
          res.render("events/new", { users: users });
        })
        .catch((error) => {
          console.error(`Error fetching users: ${error.message}`);
        });
    },
  ],

  // Create a new event
  create: [
    ensureLoggedIn,
    (req, res, next) => {
      let eventParams = getEventParams(req.body);
      eventParams.organizer = req.user._id;
      Event.create(eventParams)
        .then((event) => {
          req.flash("success", `Event was created successfully!`);
          res.locals.redirect = "/events";
          res.locals.event = event;
          next();
        })
        .catch((error) => {
          console.log(`Error saving event: ${error.message}`);
          req.flash(
            "error",
            `Failed to create event because: ${error.message}.`
          );
          res.locals.redirect = "/events/new";
          next(error);
        });
    },
  ],

  // Show a specific event and its details
  show: (req, res, next) => {
    let eventId = req.params.id;

    Event.findById(eventId)
      .populate("organizer")
      .populate("attendees")
      .exec()
      .then((event) => {
        if (!event) {
          const error = new Error("Event not found");
          error.status = 404;
          throw error;
        }

        // Fetch the user data for the event's organizer
        User.findById(event.organizer._id)
          .then((user) => {
            if (!user) {
              const error = new Error("Organizer not found");
              error.status = 404;
              throw error;
            }

            res.locals.event = event;
            res.locals.user = user;
            res.locals.attendees = event.attendees;
            next();
          })
          .catch((error) => {
            console.log(`Error fetching user by ID: ${error.message}`);
            next(error);
          });
      })
      .catch((error) => {
        console.log(`Error fetching event by ID: ${error.message}`);
        next(error);
      });
  },

  // Render the show view with event details and attendees
  showView: (req, res) => {
    res.render("events/show", { attendees: res.locals.attendees });
  },

  // Render the form for editing a specific event
  edit: [
    ensureLoggedIn,
    (req, res, next) => {
      let eventId = req.params.id;
      Event.findById(eventId)
        .then((event) => {
          User.find()
            .then((users) => {
              res.render("events/edit", {
                event: event,
                users: users,
              });
            })
            .catch((error) => {
              console.log(`Error fetching users: ${error.message}`);
              next(error);
            });
        })
        .catch((error) => {
          console.log(`Error fetching event by ID: ${error.message}`);
          next(error);
        });
    },
  ],

  // Update a specific event
  update: [ensureLoggedIn, async (req, res, next) => {
    let eventParams = getEventParams(req.body),
      eventId = req.params.id;
    // eventParams.organizer = req.user._id; 
    event = await Event.findById(eventId).populate('organizer');

    // console.log("hey");
    if (!event) {
      req.flash("error", "Event not found");
      res.locals.redirect = "/events";
      return next();
    }

    if (req.user.isAdmin || (event.organizer && event.organizer.equals(req.user._id))) {
      Event.findByIdAndUpdate(eventId, {
        $set: eventParams,
      },
        { new: true })
        .then((event) => {
          req.flash("success", `Event information updated successfully!`);
          res.locals.redirect = `/events/${eventId}`;
          res.locals.event = event;
          next();
        })
        .catch((error) => {
          console.log(`Error updating event by ID: ${error.message}`);
          req.flash("error", `Failed to update event information: ${error.message}`);
          res.locals.redirect = `/events/${eventId}/edit`;
          next(error);
        });
    } else {
      // If not authorized, redirect to the job's show page
      req.flash("error", "You are not authorized to update this event.");
      res.locals.redirect = `/events/${eventId}`;
      next();
    }
  }],

  // Delete a specific event
  delete: (req, res, next) => {
    let eventId = req.params.id;
    if (req.user && req.user.isAdmin) {
      Event.findByIdAndDelete(eventId)
        .then(() => {
          req.flash("success", "Event deleted successfully!");
          res.locals.redirect = "/events";
          next();
        })
        .catch((error) => {
          console.log(`Error deleting event by ID: ${error.message}`);
          req.flash("error", `Failed to delete event: ${error.message}`);
          next();
        });
    } else {
      // If not authorized, redirect to the event's show page
      req.flash("error", "You are not authorized to delete this event.");
      res.locals.redirect = `/events`;
      next();
    }
  },
  // Redirect middleware
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  validate: (req, res, next) => {
    // Sanitize and validate event parameters
    req.sanitizeBody("title").escape();
    req.sanitizeBody("description").escape();
    req.sanitizeBody("location").escape();
    req.sanitizeBody("startDate").toDate();
    req.sanitizeBody("endDate").toDate();
    req.sanitizeBody("isOnline").toBoolean();
    req.sanitizeBody("registrationlink").escape();
    req.sanitizeBody("organizer").escape();
    // Validation rules for the event creation form
    req.check("title").notEmpty().withMessage("Title is required");
    req.check("description").notEmpty().withMessage("Description is required");
    req.check("location").notEmpty().withMessage("Location is required");
    req.check("startDate").notEmpty().withMessage("Start Date is required");
    req.check("endDate").notEmpty().withMessage("End Date is required");
    req.check("isOnline").isBoolean().withMessage("Invalid isOnline value");
    req
      .check("organizer")
      .notEmpty()
      .isMongoId()
      .withMessage("Invalid organizer ID");

    // Get validation result
    req.getValidationResult().then((error) => {
      if (!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/events/new";
        next();
      } else {
        next();
      }
    });
  },
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    });
  },
  errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }
    res.json(errorObject);
  },
  join: (req, res, next) => {
    let eventId = req.params.id,
      currentUser = req.user; // Assuming `req.user` is the logged-in user

    if (currentUser) {
      // console.log(`User ${currentUser._id} attempting to join event ${eventId}`);

      // Updating the user document to include the event
      User.findByIdAndUpdate(currentUser._id, {
        $addToSet: { events: eventId },
      })
        .then(() => {
          // console.log(`User ${currentUser._id} added to event ${eventId}`);

          // Updating the event document to include the user in its attendees list
          return Event.findByIdAndUpdate(eventId, {
            $addToSet: { attendees: currentUser._id },
          });
        })
        .then((event) => {
          // console.log(`Event ${eventId} now has ${event.attendees.length} attendees`);
          res.locals.success = true;
          next();
        })
        .catch((error) => {
          console.error(`Error joining event: ${error.message}`);
          next(error);
        });
    } else {
      console.error("User must log in to join event.");
      next(new Error("User must log in."));
    }
  },


  filterUserEvents: (req, res, next) => {
    let currentUser = res.locals.currentUser;
    if (currentUser) {
      console.log("Filtering events based on user's joined events.");

      // Initialize currentUser.events as an empty array if it's undefined
      currentUser.events = currentUser.events || [];

      let mappedEvents = res.locals.events.map((event) => {
        let userJoined = currentUser.events.some((userEventId) => {
          return userEventId.equals(event._id);
        });
        // console.log(`User joined status for event ${event._id}: ${userJoined}`);
        return Object.assign(event.toObject(), { joined: userJoined });
      });

      res.locals.events = mappedEvents;
    } else {
      console.log("No current user found.");
    }
    next();
  },
};