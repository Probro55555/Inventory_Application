const { Router, text } = require("express");

const gameRouter = Router();

gameRouter.get("/", (req, res) => {
  res.render("form");
});


module.exports = gameRouter;