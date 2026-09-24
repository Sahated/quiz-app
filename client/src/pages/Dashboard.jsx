import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button";
import QuizCard from "../components/QuizCard";

import quizService from "../services/quiz.service";

import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

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
            setError(err.response?.data?.message || "Произошла ошибка");
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
        }

        catch (err) {
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
        }

        catch (err) {
            setError(err.response?.data?.message || "Произошла ошибка");
        }
    };

    return (
        
        <div className="dashboard">

            <div className="dashboard-header">
                <h1>Мои викторины</h1>
            </div>

            <div className="create-quiz">

                <input
                    type="text"
                    placeholder="Название новой викторины"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <Button onClick={createQuiz}>
                    Создать
                </Button>
            </div>

            <div className="join-game">
                <Button onClick={() => navigate("/join")}>
                    🎮 Присоединиться к игре
                </Button>
            </div>

            {
                error && (
                    <p className="error">
                        {error}
                    </p>
                )
            }
            {
                loading ?
                    <p>Загрузка...</p>
                    :
                    quizzes.length === 0 ?

                        <p>У вас пока нет викторин.</p>
                        :
                        quizzes.map((quiz) => (

                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onDelete={deleteQuiz}
                            />
                        ))
            }
        </div>
    );
}

export default Dashboard;
