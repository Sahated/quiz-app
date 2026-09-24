function QuestionCard({ question, onEdit, onDelete }) {
    return (
        <div className="question-card">

            <h3>
                Вопрос {question.order}
            </h3>

            <p>
                <strong>{question.text}</strong>
            </p>

            <div className="options">
                <p>A. {question.optionA}</p>
                <p>B. {question.optionB}</p>
                <p>C. {question.optionC}</p>
                <p>D. {question.optionD}</p>
            </div>

            <p>
                <strong>Правильный ответ:</strong> {question.correctAnswer}
            </p>

            <p>
                <strong>Время:</strong> {question.timeLimit} сек.
            </p>

            <div className="question-actions">
                <button onClick={() => onEdit(question)}>
                    Редактировать
                </button>

                <button onClick={() => onDelete(question.id)}>
                    Удалить
                </button>
            </div>

        </div>
    );
}

export default QuestionCard;