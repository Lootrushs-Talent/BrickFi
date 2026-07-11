const { Router } = require("express");
const { forwardErrors, requireAddressParam, requireJsonBody, requirePropertyId } = require("./error");
const propertyController = require("../controllers/property.controller");

const router = Router();

router.get("/", forwardErrors(propertyController.list));
router.get("/featured", forwardErrors(propertyController.featured));
router.get("/stats", forwardErrors(propertyController.stats));
router.get("/filters", forwardErrors(propertyController.filters));
router.get("/slug/:slug", forwardErrors(propertyController.getBySlug));
router.get("/:id/quote", requirePropertyId, forwardErrors(propertyController.quote));
router.get("/:id/chain", requirePropertyId, forwardErrors(propertyController.getChain));
router.get(
  "/:id/shares/:address",
  requirePropertyId,
  requireAddressParam("address"),
  forwardErrors(propertyController.getShares)
);
router.get("/:id", requirePropertyId, forwardErrors(propertyController.getById));
router.post("/", requireJsonBody, forwardErrors(propertyController.create));
router.patch("/:id", requirePropertyId, requireJsonBody, forwardErrors(propertyController.update));

module.exports = router;
