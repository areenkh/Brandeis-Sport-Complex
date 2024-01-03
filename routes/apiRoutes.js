const router = require("express").Router();
const eventsController = require("../controllers/eventsController");
const usersController = require("../controllers/usersController");

router.use(usersController.verifyToken);

router.get(
  "/events",
  eventsController.index,
  eventsController.filterUserEvents,
  eventsController.respondJSON
);
router.get(
  "/events/:id/join",
  eventsController.join,
  eventsController.respondJSON
);
router.use(eventsController.errorJSON);

module.exports = router;
