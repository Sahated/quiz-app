import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import socket, { connectSocket } from "../socket/socket";
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

    const isHost = !!user && !player;

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

        socket.emit("submit-answer", {
            code,
            answer,
        });
    };

    const handleFinishGame = () => {
        const confirmed = window.confirm(
            "Вы уверены, что хотите завершить игру?"
        );

        if (!confirmed) {
            return;
        }

        socket.emit("finish-game", {
            code,
        });
    };

    useEffect(() => {
        if (!socket.connected) {
            connectSocket();
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
            navigate(`/leaderboard/${code}`);
        };

        socket.on("question-start", handleQuestionStart);
        socket.on("game-finished", handleGameFinished);

        return () => {
            socket.off("question-start", handleQuestionStart);
            socket.off("game-finished", handleGameFinished);
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

    const answerDisabled =
        answerSubmitted || timeLeft <= 0;

    const getAnswerClass = (answer) => {
        let className = "answer-button";

        if (selectedAnswer === answer) {
            className += " selected";
        }

        if (answerSubmitted) {
            className += " submitted";
        }

        return className;
    };

    if (!question) {
        return (
            <div className="game-page">
                <div className="game-state">
                    <div className="game-state-icon">
                        ⏳
                    </div>

                    <h1>Ожидание вопроса</h1>

                    <p>
                        Следующий вопрос появится автоматически.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="game-page">

            <div className="game-container">

                <header className="game-header">

                    <div className="game-header-left">
                        <div className="game-label">
                            ВИКТОРИНА
                        </div>

                        <div className="game-room-code">
                            Комната: <strong>{code}</strong>
                        </div>
                    </div>

                    <div
                        className={`game-timer ${
                            timeLeft <= 5
                                ? "game-timer-danger"
                                : ""
                        }`}
                    >
                        <span className="timer-icon">
                            ⏱
                        </span>

                        <span>
                            {timeLeft}
                        </span>

                        <small>сек.</small>
                    </div>

                </header>

                {isHost && (
                    <div className="host-toolbar">
                        <div>
                            <strong>Режим организатора</strong>
                            <span>
                                Вы наблюдаете за ходом игры
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleFinishGame}
                            className="finish-game-button"
                        >
                            Завершить игру
                        </button>
                    </div>
                )}

                <main className="game-content">

                    <div className="question-progress">
                        <span>
                            Вопрос {question.order}
                        </span>

                        {answerSubmitted && (
                            <span className="answer-status">
                                ✓ Ответ принят
                            </span>
                        )}

                        {!answerSubmitted &&
                            timeLeft <= 0 && (
                                <span className="answer-status expired">
                                    Время вышло
                                </span>
                            )}
                    </div>

                    <section className="question-card">

                        <h1>
                            {question.text}
                        </h1>

                        <div className="answers">

                            <button
                                type="button"
                                className={getAnswerClass("A")}
                                onClick={() =>
                                    handleAnswer("A")
                                }
                                disabled={answerDisabled}
                            >
                                <span className="answer-letter">
                                    A
                                </span>

                                <span className="answer-text">
                                    {question.optionA}
                                </span>

                                {selectedAnswer === "A" && (
                                    <span className="answer-check">
                                        ✓
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                className={getAnswerClass("B")}
                                onClick={() =>
                                    handleAnswer("B")
                                }
                                disabled={answerDisabled}
                            >
                                <span className="answer-letter">
                                    B
                                </span>

                                <span className="answer-text">
                                    {question.optionB}
                                </span>

                                {selectedAnswer === "B" && (
                                    <span className="answer-check">
                                        ✓
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                className={getAnswerClass("C")}
                                onClick={() =>
                                    handleAnswer("C")
                                }
                                disabled={answerDisabled}
                            >
                                <span className="answer-letter">
                                    C
                                </span>

                                <span className="answer-text">
                                    {question.optionC}
                                </span>

                                {selectedAnswer === "C" && (
                                    <span className="answer-check">
                                        ✓
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                className={getAnswerClass("D")}
                                onClick={() =>
                                    handleAnswer("D")
                                }
                                disabled={answerDisabled}
                            >
                                <span className="answer-letter">
                                    D
                                </span>

                                <span className="answer-text">
                                    {question.optionD}
                                </span>

                                {selectedAnswer === "D" && (
                                    <span className="answer-check">
                                        ✓
                                    </span>
                                )}
                            </button>

                        </div>

                        {!answerSubmitted &&
                            timeLeft > 0 &&
                            !isHost && (
                                <p className="answer-hint">
                                    Выберите один вариант ответа
                                </p>
                            )}

                        {answerSubmitted && (
                            <div className="submitted-message">
                                <span>✓</span>

                                <div>
                                    <strong>
                                        Ответ принят
                                    </strong>

                                    <p>
                                        Ожидайте следующий вопрос.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!answerSubmitted &&
                            timeLeft <= 0 && (
                                <div className="submitted-message expired-message">
                                    <span>⌛</span>

                                    <div>
                                        <strong>
                                            Время вышло
                                        </strong>

                                        <p>
                                            Дождитесь следующего вопроса.
                                        </p>
                                    </div>
                                </div>
                            )}

                    </section>

                </main>

            </div>
        </div>
    );
}

export default Game;