import { useEffect, useState } from "react";
import questionService from "../services/question.service";

function QuestionForm({
    quizId,
    question,
    onCreated,
    onUpdated,
    onCancel
}) {
    const isEditMode = Boolean(question);

    const [form, setForm] = useState({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        timeLimit: 20
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (question) {
            setForm({
                text: question.text,
                optionA: question.optionA,
                optionB: question.optionB,
                optionC: question.optionC,
                optionD: question.optionD,
                correctAnswer: question.correctAnswer,
                timeLimit: question.timeLimit
            });
        } else {
            setForm({
                text: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                correctAnswer: "A",
                timeLimit: 20
            });
        }

        setError("");
    }, [question]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = {
                text: form.text,
                optionA: form.optionA,
                optionB: form.optionB,
                optionC: form.optionC,
                optionD: form.optionD,
                correctAnswer: form.correctAnswer,
                timeLimit: Number(form.timeLimit)
            };

            if (isEditMode) {
                const response = await questionService.update(
                    question.id,
                    data
                );

                onUpdated(response.data.data);
            } else {
                const response = await questionService.create({
                    ...data,
                    quizId: Number(quizId)
                });

                onCreated(response.data.data);

                setForm({
                    text: "",
                    optionA: "",
                    optionB: "",
                    optionC: "",
                    optionD: "",
                    correctAnswer: "A",
                    timeLimit: 20
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Не удалось сохранить вопрос"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="question-form"
            onSubmit={handleSubmit}
        >

            {error && (
                <div className="question-form-error">
                    {error}
                </div>
            )}

            <div className="form-group">

                <label htmlFor="question-text">
                    Текст вопроса
                </label>

                <textarea
                    id="question-text"
                    name="text"
                    value={form.text}
                    onChange={handleChange}
                    placeholder="Введите текст вопроса..."
                    required
                />

            </div>

            <div className="answers-heading">
                <h3>Варианты ответа</h3>

                <span>
                    Выберите правильный ответ ниже
                </span>
            </div>

            <div className="answers-grid">

                <div className="answer-field">
                    <span className="answer-letter">A</span>

                    <input
                        type="text"
                        name="optionA"
                        value={form.optionA}
                        onChange={handleChange}
                        placeholder="Вариант A"
                        required
                    />
                </div>

                <div className="answer-field">
                    <span className="answer-letter">B</span>

                    <input
                        type="text"
                        name="optionB"
                        value={form.optionB}
                        onChange={handleChange}
                        placeholder="Вариант B"
                        required
                    />
                </div>

                <div className="answer-field">
                    <span className="answer-letter">C</span>

                    <input
                        type="text"
                        name="optionC"
                        value={form.optionC}
                        onChange={handleChange}
                        placeholder="Вариант C"
                        required
                    />
                </div>

                <div className="answer-field">
                    <span className="answer-letter">D</span>

                    <input
                        type="text"
                        name="optionD"
                        value={form.optionD}
                        onChange={handleChange}
                        placeholder="Вариант D"
                        required
                    />
                </div>

            </div>

            <div className="question-settings">

                <div className="form-group compact">

                    <label htmlFor="correct-answer">
                        Правильный ответ
                    </label>

                    <select
                        id="correct-answer"
                        name="correctAnswer"
                        value={form.correctAnswer}
                        onChange={handleChange}
                    >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>

                </div>

                <div className="form-group compact">

                    <label htmlFor="time-limit">
                        Время на ответ
                    </label>

                    <div className="time-input">

                        <input
                            id="time-limit"
                            type="number"
                            name="timeLimit"
                            value={form.timeLimit}
                            onChange={handleChange}
                            min="5"
                            max="120"
                            required
                        />

                        <span>сек.</span>

                    </div>

                </div>

            </div>

            <div className="question-form-actions">

                <button
                    type="submit"
                    className="save-question-btn"
                    disabled={loading}
                >
                    {loading
                        ? "Сохранение..."
                        : isEditMode
                            ? "Сохранить изменения"
                            : "Добавить вопрос"}
                </button>

                {isEditMode && (
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Отмена
                    </button>
                )}

            </div>

        </form>
    );
}

export default QuestionForm;