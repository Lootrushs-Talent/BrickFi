const { Router } = require("express");
const { forwardErrors } = require("./error");
const healthController = require("../controllers/health.controller");

const router = Router();

router.get("/", forwardErrors(healthController.getHealth));
router.get("/ready", forwardErrors(healthController.getReady));

module.exports = router;
