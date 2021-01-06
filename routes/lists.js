const express = require("express");
const router = express.Router();
const models = require("../models");
const jwt = require("jsonwebtoken");
const authentication = require("../authMiddleware");
// const { sequelize } = require("../models");
const sequelize = require("sequelize");

router.post("/list-create", authentication, async (req, res) => {
  const UserId = res.locals.user.userId;
  const Name = req.body.name;
  const list = await models.DetailList.build({
    UserId: UserId,
    Name: Name,
    IsActive: true,
  });
  list.save().then((result) => res.json({ listCreated: true }));
});

router.post("/:listId/add-game", async (req, res) => {
  const ListId = req.params.listId;
  const GameId = req.body.GameId;
  let gameAdded = models.DetailListGame.build({
    GameId: GameId,
    ListId: ListId,
  });
  gameAdded.save().then((result) => {
    res.json({ gameAdded: true });
  });
});

router.post("/delete-listGame", (req, res) => {
  const listGameId = req.body.GameId;
  models.DetailListGame.destroy({
    where: {
      id: listGameId,
    },
  }).then((result) => {
    res.json({ gameDeleted: true });
  });
});

router.get("/gameList/:listId", async (req, res) => {
  let listId = req.params.listId;
  if (listId) {
    let list = await models.DetailList.findOne({
      where: {
        id: listId,
      },
      include: [
        {
          model: models.DetailListGame,
          as: "gamesList",
          include: [
            {
              model: models.Game,
              as: "game",
            },
          ],
        },
      ],
    });
    if (list) {
      res.json(list);
    } else {
      res.json({ message: "List is not available!" });
    }
  }
});

module.exports = router;
