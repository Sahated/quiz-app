import { useNavigate } from "react-router-dom";

import "./QuizCard.css";

function QuizCard({ quiz, onDelete }) {
    const navigate = useNavigate();

    return (
        <article className="quiz-card">

            <div className="quiz-card-top">

                <div className="quiz-card-icon">
                    📋
                </div>

                <button
                    className="quiz-delete-button"
                    type="button"
                    onClick={() => onDelete(quiz.id)}
                    aria-label="Удалить викторину"
                    title="Удалить"
                >
                    ×
                </button>

            </div>

            <div className="quiz-card-content">

                <h3>
                    {quiz.title}
                </h3>

                <p>
                    Создана{" "}
                    {new Date(quiz.createdAt).toLocaleDateString()}
                </p>

            </div>

            <button
                className="quiz-open-button"
                type="button"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
                Открыть
                <span>→</span>
            </button>

        </article>
    );
}

export default QuizCard;