import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import roomService from "../services/room.service";
import socket, { connectSocket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";

import "./Room.css";

function Room() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isOwner = user?.id === room?.quiz?.ownerId;

    const loadRoom = async () => {
        try {
            setError("");

            const response = await roomService.getRoom(code);
            const roomData = response.data.data;

            if (roomData.finished) {
                navigate(`/leaderboard/${code}`);
                return;
            }

            if (roomData.isStarted) {
                navigate(`/game/${code}`);
                return;
            }

            setRoom(roomData);
            setPlayers(roomData.players || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось загрузить комнату"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStartGame = () => {
        socket.emit("start-game", {
            code,
        });
    };

    useEffect(() => {
        if (!socket.connected) {
            connectSocket();
        }
    }, []);

    useEffect(() => {
        const handleSocketError = (data) => {
            setError(data.message || "Ошибка Socket.IO");
        };

        socket.on("error-message", handleSocketError);

        return () => {
            socket.off("error-message", handleSocketError);
        };
    }, []);

    useEffect(() => {
        const handleJoinedRoom = (data) => {
            if (data.success) {
                setError("");
            }
        };

        socket.on("joined-room", handleJoinedRoom);

        return () => {
            socket.off("joined-room", handleJoinedRoom);
        };
    }, []);

    useEffect(() => {
        const handleRoomUpdate = (updatedPlayers) => {
            setPlayers(updatedPlayers);
        };

        socket.on("room-update", handleRoomUpdate);

        return () => {
            socket.off("room-update", handleRoomUpdate);
        };
    }, []);

    useEffect(() => {
        const handleQuestionStart = (data) => {
            navigate(`/game/${code}`, {
                state: {
                    question: data.question,
                },
            });
        };

        socket.on("question-start", handleQuestionStart);

        return () => {
            socket.off("question-start", handleQuestionStart);
        };
    }, [code, navigate]);

    useEffect(() => {
        loadRoom();
    }, [code, navigate]);

    useEffect(() => {
        if (!room || !isOwner) {
            return;
        }

        socket.emit("join-host", {
            code,
        });
    }, [room, isOwner, code]);

    useEffect(() => {
        const handleJoinedHost = (data) => {
            if (data.success) {
                // Организатор подключён к комнате
            }
        };

        socket.on("joined-host", handleJoinedHost);

        return () => {
            socket.off("joined-host", handleJoinedHost);
        };
    }, [code]);

    if (loading) {
        return (
            <div className="room-page">
                <div className="room-state">
                    <div className="room-state-icon">⏳</div>
                    <h2>Загрузка комнаты</h2>
                    <p>Подождите немного...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="room-page">
                <div className="room-state room-state-error">
                    <div className="room-state-icon">!</div>
                    <h2>Не удалось открыть комнату</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="room-page">
                <div className="room-state">
                    <div className="room-state-icon">?</div>
                    <h2>Комната не найдена</h2>
                    <p>Проверьте код комнаты и попробуйте снова.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="room-page">
            <div className="room-container">

                <header className="room-header">
                    <div>
                        <div className="room-label">
                            ИГРОВАЯ КОМНАТА
                        </div>

                        <h1>
                            {room.quiz?.title || "Викторина"}
                        </h1>

                        <p>
                            {isOwner
                                ? "Ожидание участников перед началом игры"
                                : "Вы присоединились к игре"}
                        </p>
                    </div>

                    <div className="room-status">
                        <span className="status-dot"></span>
                        Ожидание
                    </div>
                </header>

                <section className="room-main">

                    <div className="room-code-card">
                        <div className="room-code-label">
                            КОД ИГРЫ
                        </div>

                        <div className="room-code-value">
                            {room.code}
                        </div>

                        <p>
                            Поделитесь этим кодом с участниками
                        </p>
                    </div>

                    <div className="players-card">

                        <div className="players-card-header">
                            <div>
                                <h2>Участники</h2>
                                <p>
                                    Ожидаем игроков в комнате
                                </p>
                            </div>

                            <div className="players-count">
                                {players.length}
                            </div>
                        </div>

                        {players.length === 0 ? (
                            <div className="players-empty">
                                <div className="players-empty-icon">
                                    👥
                                </div>

                                <h3>
                                    Пока никто не присоединился
                                </h3>

                                <p>
                                    Отправьте участникам код игры,
                                    чтобы они могли войти.
                                </p>
                            </div>
                        ) : (
                            <div className="players-list">
                                {players.map((player) => (
                                    <div
                                        className="player-item"
                                        key={player.id}
                                    >
                                        <div className="player-avatar">
                                            {player.nickname
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <span>
                                            {player.nickname}
                                        </span>

                                        <span className="player-ready">
                                            Готов
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {isOwner ? (
                        <div className="host-panel">
                            <div>
                                <h2>Всё готово?</h2>

                                <p>
                                    Когда все участники присоединятся,
                                    можно начинать игру.
                                </p>
                            </div>

                            <button
                                className="start-game-button"
                                type="button"
                                onClick={handleStartGame}
                            >
                                <span>🚀</span>
                                Начать игру
                            </button>
                        </div>
                    ) : (
                        <div className="waiting-panel">
                            <div className="waiting-icon">
                                ⏱
                            </div>

                            <div>
                                <h2>Ожидаем начала игры</h2>
                                <p>
                                    Организатор скоро запустит
                                    викторину. Не закрывайте страницу.
                                </p>
                            </div>
                        </div>
                    )}

                </section>
            </div>
        </div>
    );
}

export default Room;
