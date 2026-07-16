const express = require("express");

const router = express.Router();

const quizController = require("../controllers/quiz.controller.js");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, quizController.createQuiz);

router.get("/", authMiddleware, quizController.getMyQuizzes);

router.get("/:id", authMiddleware, quizController.getQuizById);

router.put("/:id", authMiddleware, quizController.updateQuiz);

router.delete("/:id", authMiddleware, quizController.deleteQuiz);

module.exports = router;