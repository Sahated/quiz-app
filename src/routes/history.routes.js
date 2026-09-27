const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const historyController = require("../controllers/history.controller");

router.get(
    "/",
    authMiddleware,
    historyController.getPlayerHistory
);

module.exports = router;
