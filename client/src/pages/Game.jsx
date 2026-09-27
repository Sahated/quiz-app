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

    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [answerSubmitted, setAnswerSubmitted] = useState(false);

    const player = JSON.parse(
        sessionStorage.getItem("player") || "null"
    );

    const isHost = !!user && !player;

    /*
     * Выбор ответа
     */
    const handleAnswerSelect = (answer) => {
        if (!player) {
            return;
        }

        if (answerSubmitted) {
            return;
        }

        if (timeLeft <= 0) {
            return;
        }

        if (question.type === "MULTIPLE") {
            setSelectedAnswers((prev) => {
                if (prev.includes(answer)) {
                    return prev.filter((item) => item !== answer);
                }

                return [...prev, answer].sort();
            });

            return;
        }

        // SINGLE
        setSelectedAnswers([answer]);
    };

    /*
     * Отправка ответа
     */
    const handleSubmitAnswer = () => {
        if (!player) {
            return;
        }

        if (answerSubmitted) {
            return;
        }

        if (timeLeft <= 0) {
            return;
        }

        if (selectedAnswers.length === 0) {
            return;
        }

        const answer = selectedAnswers.join(",");

        setAnswerSubmitted(true);

        socket.emit("submit-answer", {
            code,
            answer
        });
    };

    /*
     * Завершение игры организатором
     */
    const handleFinishGame = () => {
        const confirmed = window.confirm(
            "Вы уверены, что хотите завершить игру?"
        );

        if (!confirmed) {
            return;
        }

        socket.emit("finish-game", {
            code
        });
    };

    /*
     * Socket.IO
     */
    useEffect(() => {
        if (!socket.connected) {
            connectSocket();
        }

        const joinGameRoom = () => {
            if (player) {
                socket.emit("join-room", {
                    code,
                    nickname: player.nickname
                });
            } else if (user) {
                socket.emit("join-host", {
                    code
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
            setSelectedAnswers([]);
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
    }, [code, navigate, user]);

    /*
     * Восстановление состояния игры
     */
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
    }, [code, navigate, question, player?.id]);

    /*
     * Таймер
     */
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
        answerSubmitted || timeLeft <= 0 || isHost;

    /*
     * CSS-класс варианта ответа
     */
    const getAnswerClass = (answer) => {
        let className = "answer-button";

        if (selectedAnswers.includes(answer)) {
            className += " selected";
        }

        if (answerSubmitted) {
            className += " submitted";
        }

        return className;
    };

    /*
     * Данные вариантов
     */
    const answers = [
        {
            letter: "A",
            text: question?.optionA
        },
        {
            letter: "B",
            text: question?.optionB
        },
        {
            letter: "C",
            text: question?.optionC
        },
        {
            letter: "D",
            text: question?.optionD
        }
    ];

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

    const isMultiple = question.type === "MULTIPLE";

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

                        <div className="question-type-label">
                            {isMultiple
                                ? "Выберите несколько вариантов"
                                : "Выберите один вариант"}
                        </div>

                        <h1>
                            {question.text}
                        </h1>

                        {question.imageUrl && (
                            <div className="game-question-image">
                                <img
                                    src={`http://localhost:3000${question.imageUrl}`}
                                    alt="Изображение вопроса"
                                />
                            </div>
                        )}

                        <div className="answers">

                            {answers.map((answer) => (
                                <button
                                    key={answer.letter}
                                    type="button"
                                    className={getAnswerClass(
                                        answer.letter
                                    )}
                                    onClick={() =>
                                        handleAnswerSelect(
                                            answer.letter
                                        )
                                    }
                                    disabled={answerDisabled}
                                >
                                    <span
                                        className={`answer-selector ${
                                            isMultiple
                                                ? "checkbox"
                                                : "radio"
                                        }`}
                                    >
                                        {selectedAnswers.includes(
                                            answer.letter
                                        ) && "✓"}
                                    </span>

                                    <span className="answer-letter">
                                        {answer.letter}
                                    </span>

                                    <span className="answer-text">
                                        {answer.text}
                                    </span>
                                </button>
                            ))}

                        </div>

                        {!answerSubmitted &&
                            timeLeft > 0 &&
                            !isHost && (
                                <>
                                    <p className="answer-hint">
                                        {isMultiple
                                            ? "Можно выбрать несколько вариантов ответа"
                                            : "Выберите один вариант ответа"}
                                    </p>

                                    <button
                                        type="button"
                                        className="submit-answer-button"
                                        onClick={
                                            handleSubmitAnswer
                                        }
                                        disabled={
                                            selectedAnswers.length === 0
                                        }
                                    >
                                        Ответить
                                    </button>
                                </>
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
                                            Дождитесь следующего
                                            вопроса.
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
