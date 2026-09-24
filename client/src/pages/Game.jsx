import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import socket from "../socket/socket";
import roomService from "../services/room.service";

import "./Game.css";

function Game() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [question, setQuestion] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    
    const player = JSON.parse(
        sessionStorage.getItem("player") || "null"
    );

    const handleAnswer = (answer) => {
        if (!player) {
            return;
        }

        if (answerSubmitted) {
            return;
        }

        if (timeLeft <= 0) {
            return;
        }

        setSelectedAnswer(answer);
        setAnswerSubmitted(true);

        console.log("📤 Отправляем ответ:", {
            code,
            playerId: player.id,
            answer,
        });

        socket.emit("submit-answer", {
            code,
            playerId: player.id,
            answer,
        });
    };

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const joinGameRoom = () => {
            if (player) {
                socket.emit("join-room", {
                    code,
                    nickname: player.nickname,
                });
            } else if (user) {
                socket.emit("join-host", {
                    code,
                });
            }
        };

        if (socket.connected) {
            joinGameRoom();
        } else {
            socket.once("connect", joinGameRoom);
        }

        const handleQuestionStart = (data) => {
            setQuestion(data.question);
            setTimeLeft(data.question.timeLimit);
            setSelectedAnswer(null);
            setAnswerSubmitted(false);
        };

        const handleGameFinished = () => {
            console.log("🏁 Игра завершена");
            navigate(`/leaderboard/${code}`);
        };

        const handleAnswerResult = (data) => {
            console.log("📥 Ответ сервера:", data);
        };

        socket.on("question-start", handleQuestionStart);
        socket.on("game-finished", handleGameFinished);
        socket.on("answer-result", handleAnswerResult);

        return () => {
            socket.off("question-start", handleQuestionStart);
            socket.off("game-finished", handleGameFinished);
            socket.off("answer-result", handleAnswerResult);
            socket.off("connect", joinGameRoom);
        };
    }, [code, navigate, player, user]);

    useEffect(() => {
        const loadGameState = async () => {
            try {
                const response = await roomService.getGameState(
                    code,
                    player?.id
                );

                const gameState = response.data.data;

                if (gameState.finished) {
                    navigate(`/leaderboard/${code}`);
                    return;
                }

                if (gameState.question) {
                    setQuestion(gameState.question);
                    setTimeLeft(gameState.timeLeft);
                    setAnswerSubmitted(gameState.answered);
                }
            } catch (err) {
                console.error(
                    "Не удалось восстановить состояние игры:",
                    err
                );
            }
        };

        if (!question) {
            loadGameState();
        }

    }, [code, navigate, question]);

    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const answerDisabled = answerSubmitted || timeLeft <= 0;
    
    if (!question) {
        return (
            <div className="game-page">
                <h1>Ожидание вопроса...</h1>
            </div>
        );
    }

    return (
        <div className="game-page">
            <div className="game-header">
                <span>Комната: {code}</span>
                <span>⏱ {timeLeft} сек.</span>
            </div>

            <div className="question-card">
                <h1>{question.text}</h1>

                <div className="answers">
                    <button
                        onClick={() => handleAnswer("A")}
                        disabled={answerDisabled}
                    >
                        <strong>A.</strong> {question.optionA}
                    </button>

                    <button
                        onClick={() => handleAnswer("B")}
                        disabled={answerDisabled}
                    >
                        <strong>B.</strong> {question.optionB}
                    </button>

                    <button
                        onClick={() => handleAnswer("C")}
                        disabled={answerDisabled}
                    >
                        <strong>C.</strong> {question.optionC}
                    </button>

                    <button
                        onClick={() => handleAnswer("D")}
                        disabled={answerDisabled}
                    >
                        <strong>D.</strong> {question.optionD}
                    </button>
                </div>
            </div>

            {!player && (
                <p className="host-info">
                    Вы вошли как организатор
                </p>
            )}
        </div>
    );
}

export default Game;
