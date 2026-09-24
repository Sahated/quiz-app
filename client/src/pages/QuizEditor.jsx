import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./QuizEditor.css";

import questionService from "../services/question.service";
import quizService from "../services/quiz.service";
import roomService from "../services/room.service";
import QuestionCard from "../components/QuestionCard";
import QuestionForm from "../components/QuestionForm";


function QuizEditor() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quiz, setQuiz] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    
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

    const handleEdit = (question) => {
        setEditingQuestion(question);
    };

    const handleDelete = async (id) => {
        try {
            await questionService.delete(id);

            setQuestions((prev) => {
                const remainingQuestions = prev
                    .filter((question) => question.id !== id)
                    .map((question, index) => ({
                        ...question,
                        order: index + 1,
                    }));

                return remainingQuestions;
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось удалить вопрос"
            );
        }
    };

    const handleCreateRoom = async () => {
        try {
            setError("");

            const response = await roomService.create(id);

            const room = response.data.data;

            navigate(`/room/${room.code}`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось создать комнату"
            );
        }
    };
    
    const handleQuestionCreated = (question) => {
        setQuestions((prev) => [...prev, question]);
    };

    const handleQuestionUpdated = (updatedQuestion) => {
        setQuestions((prev) =>
            prev.map((question) =>
                question.id === updatedQuestion.id
                    ? updatedQuestion
                    : question
            )
        );

        setEditingQuestion(null);
    };

    const handleCancelEdit = () => {
        setEditingQuestion(null);
    };
    
    const loadQuiz = async () => {

    try {
        const response = await quizService.getOne(id);
        setQuiz(response.data.data);

    } catch (err) {
        setError(err.response?.data?.message || "Не удалось загрузить викторину");
    }
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

            <button onClick={handleCreateRoom}>
                Создать комнату
            </button>
            
            <p>ID викторины: {id}</p>

            {error && <p className="error">{error}</p>}
            
            <QuestionForm
                quizId={id}
                question={editingQuestion}
                onCreated={handleQuestionCreated}
                onUpdated={handleQuestionUpdated}
                onCancel={handleCancelEdit}
            />

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