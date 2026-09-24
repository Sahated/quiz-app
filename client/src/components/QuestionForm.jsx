import { useEffect, useState } from "react";
import questionService from "../services/question.service";

function QuestionForm({ quizId, question, onCreated, onUpdated, onCancel }) {

    const isEditMode = Boolean(question);

    const [form, setForm] = useState({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        timeLimit: 20,
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
                timeLimit: question.timeLimit,
            });
        } else {
            setForm({
                text: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                correctAnswer: "A",
                timeLimit: 20,
            });
        }

        setError("");
    }, [question]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
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
                timeLimit: Number(form.timeLimit),
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
                    quizId: Number(quizId),
                });

                onCreated(response.data.data);

                setForm({
                    text: "",
                    optionA: "",
                    optionB: "",
                    optionC: "",
                    optionD: "",
                    correctAnswer: "A",
                    timeLimit: 20,
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
        <form className="question-form" onSubmit={handleSubmit}>

            <h2>
                {isEditMode
                    ? "Редактировать вопрос"
                    : "Добавить вопрос"}
            </h2>

            {error && (
                <p className="error">{error}</p>
            )}

            <div className="form-group">
                <label>Текст вопроса</label>

                <textarea
                    name="text"
                    value={form.text}
                    onChange={handleChange}
                    placeholder="Введите текст вопроса"
                    required
                />
            </div>

            <div className="form-group">
                <label>Вариант A</label>

                <input
                    type="text"
                    name="optionA"
                    value={form.optionA}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Вариант B</label>

                <input
                    type="text"
                    name="optionB"
                    value={form.optionB}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Вариант C</label>

                <input
                    type="text"
                    name="optionC"
                    value={form.optionC}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Вариант D</label>

                <input
                    type="text"
                    name="optionD"
                    value={form.optionD}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Правильный ответ</label>

                <select
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

            <div className="form-group">
                <label>Время на ответ (секунды)</label>

                <input
                    type="number"
                    name="timeLimit"
                    value={form.timeLimit}
                    onChange={handleChange}
                    min="5"
                    max="120"
                    required
                />
            </div>

            <div className="question-form-actions">

                <button
                    type="submit"
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
