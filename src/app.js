const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const quizRoutes = require("./routes/quiz.routes");
const questionRoutes = require("./routes/question.routes");
const roomRoutes = require("./routes/room.routes");
const uploadRoutes = require("./routes/upload.routes");
const historyRoutes = require("./routes/history.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Quiz API работает!"
    });
});

app.use(errorMiddleware);

module.exports = app;
