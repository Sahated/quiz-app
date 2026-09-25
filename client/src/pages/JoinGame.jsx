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
            setError(data.message || "Не удалось войти в комнату.");
        };

        socket.on("joined-room", handleJoinedRoom);
        socket.on("error-message", handleSocketError);

        return () => {
            socket.off("joined-room", handleJoinedRoom);
            socket.off("error-message", handleSocketError);
        };
    }, [navigate, code]);

    return (
        <div className="join-page">
            <div className="join-card">
                <h1>🎯 Quiz App</h1>
                <h2>Вход в игру</h2>

                <input
                    type="text"
                    placeholder="Код комнаты"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={6}
                />

                <input
                    type="text"
                    placeholder="Ваш ник"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={30}
                />

                {error && <p className="error">{error}</p>}

                <button onClick={handleJoin} disabled={loading}>
                    {loading ? "Подключение..." : "Войти в игру"}
                </button>
            </div>
        </div>
    );
}

export default JoinGame;
