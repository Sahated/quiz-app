import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import roomService from "../services/room.service";

function Leaderboard() {
    const { code } = useParams();

    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadLeaderboard = async () => {

            try {

                const response =
                    await roomService.getLeaderboard(code);

                setLeaderboard(response.data.data);

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    "Не удалось загрузить результаты."
                );

            } finally {

                setLoading(false);

            }
        };

        loadLeaderboard();

    }, [code]);

    if (loading) {
        return <p>Загрузка результатов...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="leaderboard-page">

            <h1>🏆 Результаты игры</h1>

            <p>Комната: {code}</p>

            {leaderboard.length === 0 ? (
                <p>Результаты отсутствуют.</p>
            ) : (
                <ol>
                    {leaderboard.map((player) => (
                        <li key={player.id}>
                            {player.nickname} — {player.score} очков
                        </li>
                    ))}
                </ol>
            )}

        </div>
    );
}

export default Leaderboard;
