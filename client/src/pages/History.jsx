import { useEffect, useState } from "react";
import api from "../api/axios";
import "./History.css";

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await api.get("/history");
                setHistory(response.data.data || []);
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Не удалось загрузить историю."
                );
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, []);

    if (loading) {
        return (
            <div className="history-page">
                <h1>История</h1>
                <p className="history-message">Загрузка...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="history-page">
                <h1>История</h1>
                <p className="history-error">{error}</p>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-header">
                <h1>История</h1>
                <p>Ваши завершённые игры</p>
            </div>

            {history.length === 0 ? (
                <div className="history-empty">
                    <div className="history-empty-icon">📊</div>
                    <h2>История пока пуста</h2>
                    <p>
                        Здесь появятся результаты игр, в которых вы приняли
                        участие.
                    </p>
                </div>
            ) : (
                <div className="history-list">
                    {history.map((item) => (
                        <div className="history-card" key={item.id}>
                            <div className="history-card-main">
                                <h2>{item.quizTitle}</h2>

                                {item.category && (
                                    <span className="history-category">
                                        {item.category}
                                    </span>
                                )}

                                <div className="history-info">
                                    <span>
                                        Комната: <b>{item.roomCode}</b>
                                    </span>

                                    <span>
                                        Роль:{" "}
                                        <b>
                                            {item.role === "HOST"
                                                ? "Организатор"
                                                : "Участник"}
                                        </b>
                                    </span>

                                    {item.role === "PLAYER" && (
                                        <>
                                            <span>
                                                Место: <b>{item.place}</b>
                                            </span>

                                            <span>
                                                Очки: <b>{item.score}</b>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="history-date">
                                {new Date(item.playedAt).toLocaleDateString(
                                    "ru-RU"
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;
