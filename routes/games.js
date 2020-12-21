const express = require("express");
const router = express.Router();
const models = require("../models");
const jwt = require("jsonwebtoken");

router.post("/create-rating", async (req, res) => {
  let headers = req.headers["authorization"];
  const token = headers.split(" ")[1];
  const decoded = jwt.verify(token, process.env.TK_PASS);
  let userId = decoded.userId;

  const gameId = req.body.gameId;
  const gameplayRating = req.body.gameplayRating;
  const f2pRating = req.body.f2pRating;
  const playing = req.body.playing;

  let persistedUserGame = await models.UserGame.findOne({
    where: {
      UserId: userId,
      GameId: gameId,
    },
  }).catch((error) => {
    res.json({ message: error });
  });

  if (!persistedUserGame) {
    let UserGame = models.UserGame.build({
      GameId: gameId,
      UserId: userId,
      gameplayRating: gameplayRating,
      f2pRating: f2pRating,
      playing: playing,
    });
    UserGame.save()
      .then(async () => {
        await updateRating(gameId);
        res.send("Rating Saved");
      })
      .catch((error) => {
        res.json({ message: error });
      });
  } else {
    res.send("Rating already created");
  }
});

router.post("/update-rating/:ratingId", (req, res) => {
  let headers = req.headers["authorization"];
  const token = headers.split(" ")[1];
  const decoded = jwt.verify(token, process.env.TK_PASS);
  let userId = decoded.userId;

  const ratingId = req.params.ratingId;
  const gameId = req.body.gameId;
  const gameplayRating = req.body.gameplayRating;
  const f2pRating = req.body.f2pRating;
  const playing = req.body.playing;

  models.UserGame.update(
    {
      GameId: gameId,
      UserId: userId,
      gameplayRating: gameplayRating,
      f2pRating: f2pRating,
      playing: playing,
    },
    { where: { id: ratingId } }
  )
    .then(async (rating) => {
      await updateRating(gameId);
      res.send("Rating Successfully Updated");
    })
    .catch((error) => {
      res.json({ message: error });
    });
});

router.get("/my-ratings", (req, res) => {
  let headers = req.headers["authorization"];
  const token = headers.split(" ")[1];
  const decoded = jwt.verify(token, process.env.TK_PASS);
  let userId = decoded.userId;

  models.UserGame.findAll({
    where: { UserId: userId },
    include: [models.Game],
  })
    .then((list) => {
      res.send(list);
    })
    .catch((error) => {
      res.json({ message: error });
    });
});
const calRating = async (gameID) => {
  let gameRating = await models.UserGame.findAll({
    where: { GameId: gameID },
  });
  const userGame = gameRating.map((usergame) => {
    return parseFloat(usergame.gameplayRating);
  });
  totalRating = userGame.reduce((accumulator, userGame) => {
    return accumulator + userGame;
  });
  averageRating = totalRating / userGame.length;
  return averageRating;
};

const updateRating = async (gameId) => {
  let averageRating = await calRating(gameId);
  console.log(averageRating);
  await models.Game.update(
    { averageRating: averageRating },
    {
      where: {
        id: gameId,
      },
    }
  );
};

module.exports = router;
