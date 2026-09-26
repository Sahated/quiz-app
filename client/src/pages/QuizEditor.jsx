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
                err.response?.data?.message ||
                "Не удалось загрузить вопросы"
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
            setError(
                err.response?.data?.message ||
                "Не удалось загрузить викторину"
            );
        }
    };

    useEffect(() => {
        loadQuiz();
        loadQuestions();
    }, [id]);

    const handleEdit = (question) => {
        setEditingQuestion(question);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async (questionId) => {
        if (!window.confirm("Удалить этот вопрос?")) {
            return;
        }

        try {
            await questionService.delete(questionId);

            setQuestions((prev) =>
                prev
                    .filter((question) => question.id !== questionId)
                    .map((question, index) => ({
                        ...question,
                        order: index + 1
                    }))
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось удалить вопрос"
            );
        }
    };

    const handleCreateRoom = async () => {
        if (questions.length === 0) {
            setError(
                "Добавьте хотя бы один вопрос перед созданием комнаты."
            );
            return;
        }

        try {
            setError("");

            const response = await roomService.create(id);

            navigate(`/room/${response.data.data.code}`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось создать комнату."
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

    return (
        <div className="quiz-editor">

            <header className="quiz-editor-header">

                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Мои викторины
                </button>

                <div className="quiz-editor-title-row">

                    <div>
                        <span className="editor-label">
                            РЕДАКТОР ВИКТОРИНЫ
                        </span>

                        <h1>
                            {quiz ? quiz.title : "Загрузка..."}
                        </h1>

                        <p>
                            Добавляйте вопросы и настройте викторину
                            перед запуском.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="create-room-button"
                        onClick={handleCreateRoom}
                    >
                        🎮 Создать комнату
                    </button>

                </div>

            </header>

            {error && (
                <div className="quiz-editor-error">
                    {error}
                </div>
            )}

            <main className="quiz-editor-content">

                <section className="question-form-section">

                    <div className="section-heading">
                        <div>
                            <h2>
                                {editingQuestion
                                    ? "Редактирование вопроса"
                                    : "Добавить вопрос"}
                            </h2>

                            <p>
                                {editingQuestion
                                    ? "Измените параметры вопроса"
                                    : "Создайте новый вопрос для викторины"}
                            </p>
                        </div>
                    </div>

                    <QuestionForm
                        quizId={id}
                        question={editingQuestion}
                        onCreated={handleQuestionCreated}
                        onUpdated={handleQuestionUpdated}
                        onCancel={handleCancelEdit}
                    />

                </section>

                <section className="questions-section">

                    <div className="questions-section-header">

                        <div>
                            <h2>Ваши вопросы</h2>

                            <p>
                                Все вопросы этой викторины
                            </p>
                        </div>

                        <span className="questions-count">
                            {questions.length}
                        </span>

                    </div>

                    {loading ? (

                        <div className="questions-empty">
                            <p>Загрузка вопросов...</p>
                        </div>

                    ) : questions.length === 0 ? (

                        <div className="questions-empty">
                            <div className="questions-empty-icon">
                                ?
                            </div>

                            <h3>
                                Пока нет вопросов
                            </h3>

                            <p>
                                Добавьте первый вопрос с помощью
                                формы выше.
                            </p>
                        </div>

                    ) : (

                        <div className="questions-list">

                            {questions.map((question) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default QuizEditor;