const { Router } = require("express");
const { forwardErrors, requireAddressParam, requireJsonBody } = require("./error");
const activityController = require("../controllers/activity.controller");

const router = Router();

router.get("/", forwardErrors(activityController.list));
router.get("/:address", requireAddressParam("address"), forwardErrors(activityController.listByAddress));
router.post("/", requireJsonBody, forwardErrors(activityController.create));

module.exports = router;
