import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import QuizCard from "../components/QuizCard";

import quizService from "../services/quiz.service";
import { useAuth } from "../context/AuthContext";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    const loadQuizzes = async () => {
        setError("");

        try {
            const response = await quizService.getAll();
            setQuizzes(response.data.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось загрузить викторины"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuizzes();
    }, []);

    const createQuiz = async () => {
        if (!title.trim()) {
            setError("Введите название викторины.");
            return;
        }

        setError("");

        try {
            await quizService.create({
                title: title.trim()
            });

            setTitle("");
            await loadQuizzes();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось создать викторину"
            );
        }
    };

    const deleteQuiz = async (id) => {
        if (!window.confirm("Удалить викторину?")) {
            return;
        }

        try {
            await quizService.delete(id);
            await loadQuizzes();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось удалить викторину"
            );
        }
    };

    return (
        <div className="dashboard">

            {/* Приветствие */}
            <header className="dashboard-header">
                <h1>
                    Добро пожаловать
                    {user?.username ? `, ${user.username}` : ""}!
                </h1>

                <p>
                    Создавайте викторины, добавляйте вопросы
                    и запускайте игры в реальном времени.
                </p>
            </header>

            {/* Быстрые действия */}
            <section className="dashboard-actions">

                <div className="create-quiz-card">

                    <div className="section-icon">
                        +
                    </div>

                    <div className="create-quiz-content">

                        <h2>Новая викторина</h2>

                        <p>
                            Создайте викторину и добавьте вопросы
                        </p>

                        <div className="create-quiz-form">

                            <input
                                type="text"
                                placeholder="Название викторины"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        createQuiz();
                                    }
                                }}
                            />

                            <Button onClick={createQuiz}>
                                Создать
                            </Button>

                        </div>

                    </div>

                </div>

                <div className="join-game-card">

                    <div className="section-icon">
                        🎮
                    </div>

                    <div>

                        <h2>Присоединиться</h2>

                        <p>
                            Есть код комнаты? Войдите в игру как игрок.
                        </p>

                        <Button
                            onClick={() => navigate("/join")}
                        >
                            Войти в игру
                        </Button>

                    </div>

                </div>

            </section>

            {error && (
                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {/* Список викторин */}
            <section className="quizzes-section">

                <div className="quizzes-title">
                    <div>
                        <h2>Ваши викторины</h2>

                        <p>
                            Все созданные вами викторины
                        </p>
                    </div>

                    {!loading && (
                        <span className="quiz-count">
                            {quizzes.length}
                        </span>
                    )}
                </div>

                {loading ? (

                    <div className="dashboard-empty">
                        <p>Загрузка викторин...</p>
                    </div>

                ) : quizzes.length === 0 ? (

                    <div className="dashboard-empty">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>Пока нет викторин</h3>

                        <p>
                            Создайте свою первую викторину,
                            чтобы начать.
                        </p>

                    </div>

                ) : (

                    <div className="quiz-grid">

                        {quizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onDelete={deleteQuiz}
                            />
                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default Dashboard;