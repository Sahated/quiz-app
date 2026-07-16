import { useEffect, useState } from "react";

import Button from "../components/Button";
import QuizCard from "../components/QuizCard";

import quizService from "../services/quiz.service";

import "./Dashboard.css";

function Dashboard() {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");

    const loadQuizzes = async () => {

        try {
            const response = await quizService.getAll();
            setQuizzes(response.data.data);
        }

        catch (err) {
            console.log(err);
        }

        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchQuizzes = async () => {

            try {
                const response = await quizService.getAll();
                setQuizzes(response.data.data);

            } catch (err) {
                console.log(err);

            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const createQuiz = async () => {
        if (!title.trim()) return;

        try {
            await quizService.create({
                title
            });

            setTitle("");
            loadQuizzes();
        }

        catch (err) {
            console.log(err);
        }
    };

    const deleteQuiz = async (id) => {

        if (!window.confirm("Удалить викторину?")) {
            return;
        }

        try {
            await quizService.delete(id);
            loadQuizzes();
        }

        catch (err) {
            console.log(err);
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
