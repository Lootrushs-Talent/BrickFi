const { Router } = require("express");
const { forwardErrors } = require("./error");
const marketController = require("../controllers/market.controller");

const router = Router();

router.get("/overview", forwardErrors(marketController.overview));
router.get("/listings", forwardErrors(marketController.listings));

module.exports = router;
