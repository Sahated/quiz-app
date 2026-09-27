function QuestionCard({ question, onEdit, onDelete }) {
    const isMultiple = question.type === "MULTIPLE";

    return (
        <article className="question-card">

            <div className="question-card-header">

                <div className="question-number">
                    Вопрос {question.order}
                </div>

                <div className="question-actions">

                    <button
                        className="question-edit-btn"
                        type="button"
                        onClick={() => onEdit(question)}
                    >
                        Редактировать
                    </button>

                    <button
                        className="question-delete-btn"
                        type="button"
                        onClick={() => onDelete(question.id)}
                    >
                        Удалить
                    </button>

                </div>

            </div>

            <div className="question-card-content">

                <div className="question-type-badge">
                    {isMultiple
                        ? "Несколько правильных ответов"
                        : "Один правильный ответ"}
                </div>

                <h3>
                    {question.text}
                </h3>

                {question.imageUrl && (
                    <div className="question-card-image">
                        <img
                            src={`http://localhost:3000${question.imageUrl}`}
                            alt="Изображение вопроса"
                        />
                    </div>
                )}

                <div className="options">

                    <div className="option">
                        <span className="option-letter">A</span>
                        <span>{question.optionA}</span>
                    </div>

                    <div className="option">
                        <span className="option-letter">B</span>
                        <span>{question.optionB}</span>
                    </div>

                    <div className="option">
                        <span className="option-letter">C</span>
                        <span>{question.optionC}</span>
                    </div>

                    <div className="option">
                        <span className="option-letter">D</span>
                        <span>{question.optionD}</span>
                    </div>

                </div>

            </div>

            <div className="question-card-footer">

                <span>
                    ⏱ {question.timeLimit} сек.
                </span>

                <span>
                    Правильный ответ: {question.correctAnswer}
                </span>

            </div>

        </article>
    );
}

export default QuestionCard;
