const { Router } = require("express");
const { forwardErrors, requireAddressParam, requireJsonBody } = require("./error");
const watchlistController = require("../controllers/watchlist.controller");

const router = Router();

router.get("/:address", requireAddressParam("address"), forwardErrors(watchlistController.list));
router.post("/", requireJsonBody, forwardErrors(watchlistController.add));
router.delete("/", forwardErrors(watchlistController.remove));

module.exports = router;
