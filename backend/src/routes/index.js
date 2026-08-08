const { Router } = require("express");
const { forwardErrors } = require("./error");
const getCatalog = require("../controllers/catalog.controller");
const healthRoutes = require("./health.routes");
const contractRoutes = require("./contract.routes");
const propertyRoutes = require("./property.routes");
const marketRoutes = require("./market.routes");
const investorRoutes = require("./investor.routes");
const watchlistRoutes = require("./watchlist.routes");
const cartRoutes = require("./cart.routes");
const activityRoutes = require("./activity.routes");

const router = Router();

router.get("/", forwardErrors(getCatalog));
router.use("/health", healthRoutes);
router.use("/contract", contractRoutes);
router.use("/properties", propertyRoutes);
router.use("/market", marketRoutes);
router.use("/investors", investorRoutes);
router.use("/watchlist", watchlistRoutes);
router.use("/cart", cartRoutes);
router.use("/activity", activityRoutes);

module.exports = router;
