const pool = require("./pool");

async function getAllGames(particular) {
  if (particular == "" || particular == undefined) {
    const { rows } = await pool.query(
      "select * from Games order by game_id ASC",
    );
    return rows;
  } else {
    const { rows } = await pool.query(
      "select * from Games where name like ($1) order by game_id ASC",
      [`${particular}%`],
    );
    return rows;
  }
}

async function getIndiGame(game_id) {
  const { rows } = await pool.query(
    `SELECT 
      g.game_id,
      g.name,
      g.age_rating,
      g.score,
      g.image_url,
      g.genre_id,
      g.developer_id,
      gen.genre_name,
      gen.info AS genre_info,
      dev.developer_name,
      dev.location AS developer_location,
      dev.other_games AS developer_other_games
    FROM Games g
    LEFT JOIN Genres gen ON g.genre_id = gen.genre_id
    LEFT JOIN Developers dev ON g.developer_id = dev.developer_id
    WHERE g.game_id = $1`,
    [game_id],
  );
  return rows[0];
}

async function selectCategoryDev(category, developer) {
  if (category == "All" && developer == "All") {
    const { rows } = await pool.query(
      "select * from Games join Genres on Games.genre_id = Genres.genre_id join Developers on Games.developer_id = Developers.developer_id",
    );
    return rows;
  } else if (category == "All" && developer != "All") {
    const { rows } = await pool.query(
      "select * from Games join Genres on Games.genre_id = Genres.genre_id join Developers on Games.developer_id = Developers.developer_id where Developers.developer_name = ($1)",
      [developer],
    );
    return rows;
  } else if (category != "All" && developer == "All") {
    const { rows } = await pool.query(
      "select * from Games join Genres on Games.genre_id = Genres.genre_id join Developers on Games.developer_id = Developers.developer_id where Genres.genre_name = ($1)",
      [category],
    );
    return rows;
  } else {
    const { rows } = await pool.query(
      "select * from Games join Genres on Games.genre_id = Genres.genre_id join Developers on Games.developer_id = Developers.developer_id where Developers.developer_name = ($1) and Genres.genre_name = ($2)",
      [developer, category],
    );
    return rows;
  }
}

async function insertGame(
  name,
  age_rating,
  score,
  image_url,
  genre_id,
  developer_id,
) {
  await pool.query(
    "INSERT INTO Games (name, age_rating, score, image_url, genre_id, developer_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [name, age_rating, score, image_url, genre_id, developer_id],
  );
}

async function updateGame(
  name,
  age_rating,
  score,
  image_url,
  genre_id,
  developer_id,
  game_id,
) {
  await pool.query(
    "UPDATE Games SET name = $1, age_rating = $2, score = $3, image_url = $4, genre_id = $5, developer_id = $6 WHERE game_id = $7",
    [name, age_rating, score, image_url, genre_id, developer_id, game_id],
  );
}

async function delete_game(id) {
  await pool.query("delete from Games where game_id = ($1)", [id]);
}

async function getAllGenres() {
  const { rows } = await pool.query("select * from Genres");
  return rows;
}

async function getAllDevs() {
  const { rows } = await pool.query("select * from Developers");
  return rows;
}

module.exports = {
  getAllGames,
  getIndiGame,
  selectCategoryDev,
  insertGame,
  getAllGenres,
  getAllDevs,
  updateGame,
  delete_game,
};
