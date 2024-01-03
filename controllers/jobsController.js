
// Importing the Job model and User controller
const Job = require("../models/job");
const userController = require("./usersController");
const { body } = require('express-validator');


// Function to extract relevant job parameters from the request body
const getJobParams = (body) => {
  return {
    title: body.title,
    company: body.company,
    location: body.location,
    description: body.description,
    requirements: body.requirements,
    salary: body.salary,
    contactEmail: body.contactEmail,
    contactPhone: body.contactPhone,
    postDate: body.postDate,
    deadlineDate: body.deadlineDate,
    isActive: body.isActive === "on",
    user: body.user,
  };
};

// Exporting the jobs controller methods
module.exports = {
  // Index method to fetch all jobs
  index: (req, res, next) => {
    Job.find()
      .then((jobs) => {
        res.locals.jobs = jobs;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching jobs: ${error.message}`);
        next(error);
      });
  },

  // Render the index view with the jobs
  indexView: (req, res) => {
    res.render("jobs/index");
  },

  // Render the form for creating a new job
  new: [userController.ensureLoggedIn,  (req, res) => {
    // Create an empty job object to pass to the view
    const job = new Job();
    res.render("jobs/new", { job: job });
  }],

  // Create a new job
  create:[userController.ensureLoggedIn, (req, res, next) => {
    let jobParams = getJobParams(req.body);
    jobParams.user = req.user._id;
    Job.create(jobParams)
      .then((job) => {
        req.flash("success", `Job was created successfully!`);
        res.locals.redirect = "/jobs";
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error saving job: ${error.message}`);
        req.flash("error", `Failed to create job because: ${error.message}.`);
        res.locals.redirect = "/jobs/new";
        next(error);
      });
  }],

  // Redirect middleware
  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  // Show a specific job and its details
  show: (req, res, next) => {
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  },

  // Render the show view with job details
  showView: (req, res) => {
    res.render("jobs/show");
  },

  // Render the form for editing a specific job
  edit: [userController.ensureLoggedIn,(req, res, next) => {
    let jobId = req.params.id;
    Job.findById(jobId)
      .then((job) => {
        res.render("jobs/edit", {
          job: job,
        });
      })
      .catch((error) => {
        console.log(`Error fetching job by ID: ${error.message}`);
        next(error);
      });
  }],

  // Update a specific job
  update: [userController.ensureLoggedIn, async (req, res, next) => {
    let jobId = req.params.id,
      jobParams = getJobParams(req.body);
      job = await Job.findById(jobId).populate('user');


      if (!job) {
        req.flash("error", "Job not found");
        res.locals.redirect = "/jobs";
        return next();
      }
    if (req.user.isAdmin || (jobParams.user && job.user._id.equals(req.user._id))) {
    Job.findByIdAndUpdate(jobId, {
      $set: jobParams,
    })
      .then((job) => {
        req.flash("success", `Job information updated successfully!`);
        res.locals.redirect = `/jobs/${jobId}`;
        res.locals.job = job;
        next();
      })
      .catch((error) => {
        console.log(`Error updating job by ID: ${error.message}`);
        req.flash(
          "error",
          `Failed to update job information: ${error.message}`
        );
        res.locals.redirect = `/jobs/${jobId}/edit`;
        next(error);
      });
    }else{
        // If not authorized, redirect to the job's show page
        req.flash("error", "You are not authorized to update this job.");
        res.locals.redirect = `/jobs/${jobId}`;
        next();
    }
  }],

  // Delete a specific job
  delete: (req, res, next) => {
    let jobId = req.params.id;
    if (req.user.isAdmin) {
    Job.findByIdAndDelete(jobId)
      .then(() => {
        req.flash("success", "Job deleted successfully!");
        res.locals.redirect = "/jobs";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting job by ID: ${error.message}`);
        next();
      });
    }else{
      // If not authorized, redirect to the job's show page
      req.flash("error", "You are not authorized to delete this job.");
      res.locals.redirect = `/jobs/${jobId}`;
      next();
    }
  },
  validate: (req, res, next) => {
    // Sanitize and validate job parameters
    req.sanitizeBody("title").escape();
    req.sanitizeBody("company").escape();
    req.sanitizeBody("location").escape();
    req.sanitizeBody("description").escape();
    req.sanitizeBody("requirements").escape();
    req.sanitizeBody("salary").escape();
    req
    .sanitizeBody("contactEmail")
    .normalizeEmail({
      all_lowercase: true,
    })
    .trim();
  req.check("contactEmail", "Email is invalid").isEmail();
    // req.sanitizeBody("contactEmail").normalizeEmail({ all_lowercase: true }).escape();
    req.sanitizeBody("contactPhone").escape();
    req.sanitizeBody("postDate").toDate();
    req.sanitizeBody("deadlineDate").toDate();
    req.check("title").notEmpty().withMessage("Title is required");
    req.check("company").notEmpty().withMessage("Company is required");
    req.check("location").notEmpty().withMessage("Location is required");
    req.check("description").notEmpty().withMessage("Description is required");
    req.check("requirements").notEmpty().withMessage("Requirements are required");
    req.check("salary").notEmpty()
    .isInt()
    .withMessage("Salary is invalid");
    req.check("contactEmail").isEmail().withMessage("Contact email is invalid");
    //check if it's a number of 9 digits
    req.check("contactPhone")
    .notEmpty()
      .isInt()
      .isLength({
        min: 10,
        max: 10,
      }).withMessage("Contact phone is invalid");
    
    // req.check("postDate").custom(isValidDate).withMessage("Invalid post date");
    // req.check("deadlineDate").custom(isValidDate).withMessage("Invalid deadline date");

    // Get validation result
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const messages = errors.array().map((e) => e.msg);
    //   req.skip = true;
    //   req.flash("error", messages.join(" and "));
    //   res.locals.redirect = "/jobs/new";
    //   next();
    // } else {
    //   next();
    // }

    req.getValidationResult().then((error) => {
      if (!error.isEmpty()) {
        let messages = error.array().map((e) => e.msg);
        req.skip = true;
        req.flash("error", messages.join(" and "));
        res.locals.redirect = "/jobs/new";
        next();
      } else {
        next();
      }
    });
  }
};

