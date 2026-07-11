const { Router } = require("express");
const { forwardErrors } = require("./error");
const contractController = require("../controllers/contract.controller");

const router = Router();

router.get("/", forwardErrors(contractController.getContract));
router.get("/status", forwardErrors(contractController.getStatus));
router.get("/network", forwardErrors(contractController.getNetwork));

module.exports = router;
