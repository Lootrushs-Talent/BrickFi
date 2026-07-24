const quoteService = require("../services/quote.service");
const { wrapAll } = require("./error");

async function quote(req, res) {
  res.json(await quoteService.quoteCart(req.body.items));
}

module.exports = wrapAll({ quote });
