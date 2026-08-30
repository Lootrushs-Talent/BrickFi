const { Router } = require("express");
const { forwardErrors, requireAddressParam } = require("./error");
const investorController = require("../controllers/investor.controller");

const router = Router();

router.get(
  "/:address/portfolio",
  requireAddressParam("address"),
  forwardErrors(investorController.getPortfolio)
);
router.get("/:address/quote", requireAddressParam("address"), forwardErrors(investorController.getQuote));
router.get("/:address", requireAddressParam("address"), forwardErrors(investorController.getProfile));

module.exports = router;
