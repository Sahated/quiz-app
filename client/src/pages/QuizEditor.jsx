import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import questionService from "../services/question.service";
import quizService from "../services/quiz.service";
import QuestionCard from "../components/QuestionCard";

function QuizEditor() {

    const { id } = useParams();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quiz, setQuiz] = useState(null);

    const loadQuestions = async () => {
        setError("");

        try {
            const response = await questionService.getAll(id);
            setQuestions(response.data.data);

        } catch (err) {
            setError(
                err.response?.data?.message || "Не удалось загрузить вопросы"
            );

        } finally {
            setLoading(false);
        }
    };

    const loadQuiz = async () => {

    try {
        const response = await quizService.getOne(id);
        setQuiz(response.data.data);

    } catch (err) {
        setError(err.response?.data?.message || "Не удалось загрузить викторину");
    }
    };

    const handleEdit = (question) => {
        console.log(question);
    };

    const handleDelete = (id) => {
        console.log(id);
    };
    
    useEffect(() => {
        loadQuiz();
        loadQuestions();
    }, [id]);

    return (

        <div className="quiz-editor">
            <h1>Редактор викторин</h1>
            <h2>
                {quiz ? quiz.title : "Загрузка..."}
            </h2>
            <p>ID викторины: {id}</p>

            {error && <p className="error">{error}</p>}

            {loading ? (
                <p>Загрузка...</p>

            ) : questions.length === 0 ? (
                <p>В этой викторине пока нет вопросов.</p>
            ) : (
                questions.map((question) => (

                    <QuestionCard
                        key={question.id}
                        question={question}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />

                ))
            )}
        </div>
    );
}

export default QuizEditor;