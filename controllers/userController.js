/* const db = require("../db/queries");

async function getAllGames(req, res) {
  const { game_name } = req.query;
  
  if (game_name) {
    const indi_game = await db.getAllGames(game_name);
    console.log("1", indi_game);
    res.render("index", { games: indi_game });
  } else {
    const rows = await db.getAllGames(game_name);
    

    res.render("index", { games: rows });
  }
}

async function getCategoryGames(req, res) {
  const { category } = req.query;
  const { developer } = req.query;
  console.log(category);
  console.log(developer);
 

  const rows = await db.selectCategoryDev(category, developer);
  console.log(rows);
  res.render("index", { games: rows });
}

async function getIndiGame(req, res) {
  const { game_id } = req.params;
  const indi_game = await db.getIndiGame(game_id);
  console.log(indi_game);

  res.render("indi_game", { game: indi_game });
}

async function add_game(req, res) {
  const { game_name } = req.body;
  const { age_rating } = req.body;
  const { score } = req.body;
  const { genre } = req.body;
  const { developer_id } = req.body;
  await db.insertGame(game_name, age_rating, score, genre, developer_id);
  res.redirect("/");
}

async function update_form(req, res) {
  const { game_id } = req.params;
  const indi_game = await db.getIndiGame(game_id);
  const genres = await db.getAllGenres();
  const developers = await db.getAllDevs();
  console.log("Genre row:", genres[0]);
  console.log("Dev row:", developers[0]);
  res.render("update_form", {
    game: indi_game,
    genres: genres,
    developers: developers,
  });
}

async function game_update(req, res) {
  const { game_id } = req.params;
  console.log(game_id);
  const { game_name } = req.body;
  const { age_rating } = req.body;
  const { score } = req.body;
  const { genre } = req.body;
  const { developer_id } = req.body;

  await db.updateGame(
    game_name,
    age_rating,
    score,
    genre,
    developer_id,
    game_id,
  );
  res.redirect("/");
}

async function delete_game(req, res) {
  const { game_id } = req.params;
  await db.delete_game(game_id);
  res.redirect("/");
}

module.exports = {
  getAllGames,
  getIndiGame,
  getCategoryGames,
  add_game,
  update_form,
  game_update,
  delete_game,
};
  */
process.loadEnvFile();
const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

async function getAllGames(req, res) {
  const { game_name } = req.query;
  if (game_name) {
    const indi_game = await db.getAllGames(game_name);
    res.render("index", { games: indi_game });
  } else {
    const rows = await db.getAllGames(game_name);
    res.render("index", { games: rows });
  }
}

async function getCategoryGames(req, res) {
  const { category, developer } = req.query;
  const rows = await db.selectCategoryDev(category, developer);
  res.render("index", { games: rows });
}

async function getIndiGame(req, res) {
  const { game_id } = req.params;
  const indi_game = await db.getIndiGame(game_id);
  res.render("indi_game", { game: indi_game, errors: [] });
}

// Validation & Sanitization for creating a game
const validateNewGame = [
  body("game_name")
    .trim()
    .notEmpty()
    .withMessage("Game name is required.")
    .isLength({ max: 100 })
    .withMessage("Game name cannot exceed 100 characters."),
  body("age_rating")
    .trim()
    .isIn(["Kids", "Teen", "Mature 17+"])
    .withMessage("Please choose a valid age rating."),
  body("score")
    .trim()
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be a number between 0 and 100."),
  body("image_url")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Image URL must be a valid URL."),
  body("genre")
    .trim()
    .isInt()
    .withMessage("A valid genre selection is required."),
  body("developer_id")
    .trim()
    .isInt()
    .withMessage("A valid developer selection is required."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("form", {
        errors: errors.array(),
        prev: req.body,
      });
    }

    const { game_name, age_rating, score, image_url, genre, developer_id } =
      req.body;
    const finalImageUrl =
      image_url && image_url.trim() !== "" ? image_url.trim() : null;

    await db.insertGame(
      game_name,
      age_rating,
      score,
      finalImageUrl,
      genre,
      developer_id,
    );
    res.redirect("/");
  },
];

async function update_form(req, res) {
  const { game_id } = req.params;
  const indi_game = await db.getIndiGame(game_id);
  const genres = await db.getAllGenres();
  const developers = await db.getAllDevs();

  res.render("update_form", {
    game: indi_game,
    genres: genres,
    developers: developers,
    errors: [],
  });
}

// Validation, Sanitization, & Passcode Protection for updating a game
const validateUpdateGame = [
  body("game_name")
    .trim()
    .notEmpty()
    .withMessage("Game name is required.")
    .isLength({ max: 100 })
    .withMessage("Game name cannot exceed 100 characters."),
  body("age_rating")
    .trim()
    .isIn(["Kids", "Teen", "Mature 17+"])
    .withMessage("Please choose a valid age rating."),
  body("score")
    .trim()
    .isInt({ min: 0, max: 100 })
    .withMessage("Score must be a number between 0 and 100."),
  body("image_url")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Image URL must be a valid URL."),
  body("genre").trim().isInt().withMessage("A valid genre must be selected."),
  body("developer")
    .trim()
    .isInt()
    .withMessage("A valid developer must be selected."),
  body("admin_passcode").custom((val) => {
    if (val !== process.env.ADMIN_PASSCODE) {
      throw new Error("Invalid admin passcode. Update authorization failed.");
    }
    return true;
  }),
  async (req, res) => {
    const { game_id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const genres = await db.getAllGenres();
      const developers = await db.getAllDevs();

      return res.status(400).render("update_form", {
        game: {
          game_id: game_id,
          name: req.body.game_name,
          age_rating: req.body.age_rating,
          score: req.body.score,
          image_url: req.body.image_url,
          genre_id: req.body.genre,
          developer_id: req.body.developer,
        },
        genres: genres,
        developers: developers,
        errors: errors.array(),
      });
    }

    const { game_name, age_rating, score, image_url, genre, developer } =
      req.body;
    const finalImageUrl =
      image_url && image_url.trim() !== "" ? image_url.trim() : null;

    await db.updateGame(
      game_name,
      age_rating,
      score,
      finalImageUrl,
      genre,
      developer,
      game_id,
    );
    res.redirect("/");
  },
];

// Passcode-Protected Deletion
const validateDeleteGame = [
  body("admin_passcode").custom((val) => {
    if (val !== process.env.ADMIN_PASSCODE) {
      throw new Error("Invalid admin passcode. Deletion forbidden.");
    }
    return true;
  }),
  async (req, res) => {
    const { game_id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const indi_game = await db.getIndiGame(game_id);
      return res.status(403).render("indi_game", {
        game: indi_game,
        errors: errors.array(),
      });
    }

    await db.delete_game(game_id);
    res.redirect("/");
  },
];

module.exports = {
  getAllGames,
  getIndiGame,
  getCategoryGames,
  add_game: validateNewGame,
  update_form,
  game_update: validateUpdateGame,
  delete_game: validateDeleteGame,
};
