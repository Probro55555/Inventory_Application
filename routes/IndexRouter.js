const { Router } = require("express");
const userController = require("../controllers/userController");

const IndexRouter = Router();

IndexRouter.get("/", userController.getAllGames);
IndexRouter.get("/category", userController.getCategoryGames);
IndexRouter.get("/games/:game_id", userController.getIndiGame);
IndexRouter.post("/new", userController.add_game);
IndexRouter.get("/games/:game_id/update", userController.update_form);
IndexRouter.post("/games/:game_id/update", userController.game_update);
IndexRouter.post("/games/:game_id/delete", userController.delete_game);

IndexRouter.get("/{*splat}", (req, res) => {
  res.render("error");
});

module.exports = IndexRouter;
