const router = require("express").Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.respondHome);
router.get("/about", homeController.showAbout);
router.get("/contact", homeController.showContact);
router.get("/chat", homeController.chat);
router.get("/facilities", homeController.showFacilities);
router.get("/membership", homeController.showMembership);

module.exports = router;
