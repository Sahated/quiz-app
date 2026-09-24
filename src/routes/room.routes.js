const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roomController = require("../controllers/room.controller");

router.post(
    "/",
    authMiddleware,
    roomController.create
);

router.post(
    "/join",
    roomController.join
);

router.get(
    "/:code/game-state",
    roomController.getGameState
);

router.get(
    "/:code/leaderboard",
    roomController.getLeaderboard
);

router.get(
    "/:code",
    roomController.getRoom
);

router.get(
    "/:code/players",
    roomController.getPlayers
);

router.delete(
    "/:id",
    authMiddleware,
    roomController.delete
);

module.exports = router;