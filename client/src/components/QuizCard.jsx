import { useNavigate } from "react-router-dom";

import "./QuizCard.css";

function QuizCard({ quiz, onDelete }) {

    const navigate = useNavigate();

    return (

        <div className="quiz-card">

            <div>
                <h3>{quiz.title}</h3>
                <p>
                    Создана: {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="quiz-actions">

                <button
                    className="open-btn"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                >
                    Открыть
                </button>

                <button
                    className="delete-btn"
                    onClick={() => onDelete(quiz.id)}
                >
                    Удалить
                </button>
            </div>
        </div>
    );
}

export default QuizCard;
