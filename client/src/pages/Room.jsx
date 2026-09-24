import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import roomService from "../services/room.service";
import socket from "../socket/socket";

import "./Room.css";

function Room() {

    const { code } = useParams();

    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nickname, setNickname] = useState("");

    const loadRoom = async () => {
        try {
            setError("");

            const response = await roomService.getRoom(code);

            setRoom(response.data.data);
            setPlayers(response.data.data.players || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось загрузить комнату"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = () => {
        if (!nickname.trim()) {
            setError("Введите ник.");
            return;
        }

        socket.emit("join-room", {
            code,
            nickname: nickname.trim(),
        });
    };
    
    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect();
        };
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
                console.log("Успешно вошли в комнату:", data.player);
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
        loadRoom();
    }, [code]);

    if (loading) {
        return <p>Загрузка комнаты...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    if (!room) {
        return <p>Комната не найдена.</p>;
    }

    return (
        <div className="room-page">

            <h1>Игровая комната</h1>

            <div className="room-code">
                <p>Код комнаты:</p>
                <strong>{room.code}</strong>
            </div>

            <div className="room-info">
                <h2>
                    {room.quiz?.title || "Викторина"}
                </h2>

                <p>
                    Участников: {players.length}
                </p>
            </div>

            <div className="join-room">
                <h2>Войти в комнату</h2>

                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Введите ваш ник"
                />

                <button onClick={handleJoinRoom}>
                    Войти
                </button>
            </div>

            <div className="players-list">

                <h2>Участники</h2>

                {players.length === 0 ? (
                    <p>
                        Пока никто не присоединился.
                    </p>
                ) : (
                    <ul>
                        {players.map((player) => (
                            <li key={player.id}>
                                {player.nickname}
                            </li>
                        ))}
                    </ul>
                )}

            </div>

        </div>
    );
}

export default Room;