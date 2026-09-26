import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import roomService from "../services/room.service";
import { useAuth } from "../context/AuthContext";

import "./Leaderboard.css";

function Leaderboard() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

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

    const handleBack = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/join");
        }
    };

    if (loading) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-state">
                    <div className="leaderboard-state-icon">
                        🏆
                    </div>

                    <h2>Загрузка результатов</h2>

                    <p>
                        Подождите немного...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-state leaderboard-error">
                    <div className="leaderboard-state-icon">
                        !
                    </div>

                    <h2>Не удалось загрузить результаты</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={handleBack}
                    >
                        Вернуться
                    </button>
                </div>
            </div>
        );
    }

    const firstPlace = leaderboard[0];
    const otherPlayers = leaderboard.slice(1);

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-container">

                <header className="leaderboard-header">
                    <div className="leaderboard-icon">
                        🏆
                    </div>

                    <div>
                        <div className="leaderboard-label">
                            ИГРА ЗАВЕРШЕНА
                        </div>

                        <h1>
                            Результаты игры
                        </h1>

                        <p>
                            Комната: <strong>{code}</strong>
                        </p>
                    </div>
                </header>

                {leaderboard.length === 0 ? (
                    <section className="leaderboard-empty">
                        <div className="empty-icon">
                            📊
                        </div>

                        <h2>
                            Результаты отсутствуют
                        </h2>

                        <p>
                            В этой игре пока нет результатов.
                        </p>
                    </section>
                ) : (
                    <>
                        {firstPlace && (
                            <section className="winner-card">
                                <div className="winner-crown">
                                    🏆
                                </div>

                                <div className="winner-info">
                                    <span>
                                        Победитель
                                    </span>

                                    <h2>
                                        {firstPlace.nickname}
                                    </h2>

                                    <p>
                                        {firstPlace.score}{" "}
                                        {firstPlace.score === 1
                                            ? "очко"
                                            : "очков"}
                                    </p>
                                </div>

                                <div className="winner-place">
                                    1
                                </div>
                            </section>
                        )}

                        <section className="results-card">

                            <div className="results-header">
                                <div>
                                    <h2>
                                        Таблица результатов
                                    </h2>

                                    <p>
                                        Всего участников:{" "}
                                        {leaderboard.length}
                                    </p>
                                </div>
                            </div>

                            <div className="results-list">

                                {otherPlayers.map(
                                    (player, index) => {
                                        const place = index + 2;

                                        return (
                                            <div
                                                className="result-row"
                                                key={player.id}
                                            >
                                                <div className="result-place">
                                                    {place}
                                                </div>

                                                <div className="result-avatar">
                                                    {player.nickname
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="result-player">
                                                    {player.nickname}
                                                </div>

                                                <div className="result-score">
                                                    {player.score}
                                                    <span>
                                                        очков
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        </section>
                    </>
                )}

                <div className="leaderboard-actions">
                    <button
                        type="button"
                        className="back-button"
                        onClick={handleBack}
                    >
                        ← {user
                            ? "Вернуться к викторинам"
                            : "Вернуться"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Leaderboard;
