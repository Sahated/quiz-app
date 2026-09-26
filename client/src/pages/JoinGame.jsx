import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import socket, { connectSocket } from "../socket/socket";

import "./JoinGame.css";

function JoinGame() {
    const navigate = useNavigate();

    const [code, setCode] = useState("");
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleJoin = () => {
        const roomCode = code.trim().toUpperCase();
        const playerNickname = nickname.trim();

        if (!roomCode) {
            setError("Введите код комнаты.");
            return;
        }

        if (!playerNickname) {
            setError("Введите ник.");
            return;
        }

        setError("");
        setLoading(true);

        if (!socket.connected) {
            connectSocket();
        }

        socket.emit("join-room", {
            code: roomCode,
            nickname: playerNickname,
        });
    };

    useEffect(() => {
        const handleJoinedRoom = (data) => {
            if (!data.success) {
                setLoading(false);
                return;
            }

            sessionStorage.setItem(
                "player",
                JSON.stringify(data.player)
            );

            navigate(`/room/${code.trim().toUpperCase()}`);
        };

        const handleSocketError = (data) => {
            setLoading(false);
            setError(
                data.message ||
                "Не удалось войти в комнату."
            );
        };

        socket.on("joined-room", handleJoinedRoom);
        socket.on("error-message", handleSocketError);

        return () => {
            socket.off("joined-room", handleJoinedRoom);
            socket.off("error-message", handleSocketError);
        };
    }, [navigate, code]);

    const handleCodeChange = (event) => {
        setCode(
            event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "")
        );

        if (error) {
            setError("");
        }
    };

    const handleNicknameChange = (event) => {
        setNickname(event.target.value);

        if (error) {
            setError("");
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !loading) {
            handleJoin();
        }
    };

    return (
        <div className="join-page">
            <div className="join-container">

                <div className="join-brand">
                    <div className="join-brand-icon">
                        🎯
                    </div>

                    <span>Quiz App</span>
                </div>

                <div className="join-card">

                    <div className="join-card-header">
                        <div className="join-icon">
                            🎮
                        </div>

                        <h1>Вход в игру</h1>

                        <p>
                            Введите код комнаты и ваше имя,
                            чтобы присоединиться к викторине.
                        </p>
                    </div>

                    <div className="join-form">

                        <div className="join-field">
                            <label htmlFor="room-code">
                                Код комнаты
                            </label>

                            <input
                                id="room-code"
                                type="text"
                                placeholder="Например, A7K3P"
                                value={code}
                                onChange={handleCodeChange}
                                onKeyDown={handleKeyDown}
                                maxLength={6}
                                autoComplete="off"
                                autoFocus
                            />

                            <span className="join-field-hint">
                                Код должен содержать до 6 символов
                            </span>
                        </div>

                        <div className="join-field">
                            <label htmlFor="nickname">
                                Ваш ник
                            </label>

                            <input
                                id="nickname"
                                type="text"
                                placeholder="Как вас будут видеть игроки?"
                                value={nickname}
                                onChange={handleNicknameChange}
                                onKeyDown={handleKeyDown}
                                maxLength={30}
                                autoComplete="off"
                            />
                        </div>

                        {error && (
                            <div className="join-error">
                                <span>!</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            className="join-button"
                            type="button"
                            onClick={handleJoin}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="join-spinner"></span>
                                    Подключение...
                                </>
                            ) : (
                                <>
                                    Войти в игру
                                    <span className="join-button-arrow">
                                        →
                                    </span>
                                </>
                            )}
                        </button>

                    </div>
                </div>

                <p className="join-footer">
                    После входа вы попадёте в комнату ожидания
                </p>

            </div>
        </div>
    );
}

export default JoinGame;