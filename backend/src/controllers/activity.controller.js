const activityService = require("../services/activity.service");
const { wrapAll } = require("./error");

async function list(req, res) {
  res.json(activityService.list(req.query));
}

async function listByAddress(req, res) {
  res.json(
    activityService.list({
      address: req.params.address,
      propertyId: req.query.propertyId,
      limit: req.query.limit,
    })
  );
}

async function create(req, res) {
  res.status(201).json(activityService.create(req.body));
}

module.exports = wrapAll({
  list,
  listByAddress,
  create,
});
