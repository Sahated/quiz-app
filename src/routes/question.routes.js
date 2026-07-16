const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const questionController = require("../controllers/question.controller");

router.post(
    "/",
    authMiddleware,
    questionController.create
);

router.get(
    "/quiz/:quizId",
    authMiddleware,
    questionController.getAll
);

router.get(
    "/:id",
    authMiddleware,
    questionController.getOne
);

router.put(
    "/:id",
    authMiddleware,
    questionController.update
);

router.delete(
    "/:id",
    authMiddleware,
    questionController.delete
);

module.exports = router;