const router = require("express").Router();
const jobsController = require("../controllers/jobsController");

router.get('/', jobsController.index, jobsController.indexView);
router.get('/new', jobsController.new);
router.post('/create', jobsController.validate, jobsController.create, jobsController.redirectView);
router.get('/:id', jobsController.show, jobsController.showView);
router.get('/:id/edit', jobsController.edit);
router.put('/:id/update', jobsController.update, jobsController.redirectView);
router.delete('/:id/delete', jobsController.delete, jobsController.redirectView);

module.exports = router;
