const { Router } = require("express");
const { forwardErrors, requireCartItems, requireJsonBody } = require("./error");
const cartController = require("../controllers/cart.controller");

const router = Router();

router.post("/quote", requireJsonBody, requireCartItems, forwardErrors(cartController.quote));

module.exports = router;
