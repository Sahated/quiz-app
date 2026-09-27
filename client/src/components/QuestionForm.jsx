import { useEffect, useState } from "react";
import questionService from "../services/question.service";
import api from "../api/axios";

const EMPTY_FORM = {
    text: "",
    imageUrl: "",
    type: "SINGLE",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswers: ["A"],
    timeLimit: 20
};

const API_URL = "http://localhost:3000";

function QuestionForm({
    quizId,
    question,
    onCreated,
    onUpdated,
    onCancel
}) {
    const isEditMode = Boolean(question);

    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (question) {
            const type = question.type || "SINGLE";

            const correctAnswers = String(
                question.correctAnswer || "A"
            )
                .split(",")
                .map((answer) => answer.trim().toUpperCase())
                .filter(Boolean);

            setForm({
                text: question.text || "",
                imageUrl: question.imageUrl || "",
                type,
                optionA: question.optionA || "",
                optionB: question.optionB || "",
                optionC: question.optionC || "",
                optionD: question.optionD || "",
                correctAnswers:
                    type === "MULTIPLE"
                        ? correctAnswers
                        : [correctAnswers[0] || "A"],
                timeLimit: question.timeLimit || 20
            });

            if (question.imageUrl) {
                setPreviewUrl(
                    `${API_URL}${question.imageUrl}`
                );
            } else {
                setPreviewUrl("");
            }
        } else {
            setForm(EMPTY_FORM);
            setSelectedFile(null);
            setPreviewUrl("");
        }

        setError("");
    }, [question]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;

        setForm((prev) => ({
            ...prev,
            type,
            correctAnswers:
                type === "SINGLE"
                    ? [prev.correctAnswers[0] || "A"]
                    : prev.correctAnswers.length > 0
                        ? prev.correctAnswers
                        : ["A"]
        }));
    };

    const handleCorrectAnswerChange = (letter) => {
        setForm((prev) => {
            if (prev.type === "SINGLE") {
                return {
                    ...prev,
                    correctAnswers: [letter]
                };
            }

            const alreadySelected =
                prev.correctAnswers.includes(letter);

            return {
                ...prev,
                correctAnswers: alreadySelected
                    ? prev.correctAnswers.filter(
                        (answer) => answer !== letter
                    )
                    : [...prev.correctAnswers, letter]
            };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Можно загружать только JPG, PNG или WEBP."
            );

            e.target.value = "";
            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                "Размер изображения не должен превышать 5 МБ."
            );

            e.target.value = "";
            return;
        }

        setError("");
        setSelectedFile(file);

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);

        setForm((prev) => ({
            ...prev,
            imageUrl: ""
        }));

        setPreviewUrl("");

        const input = document.getElementById(
            "question-image"
        );

        if (input) {
            input.value = "";
        }
    };

    const uploadImage = async () => {
        if (!selectedFile) {
            return form.imageUrl || null;
        }

        const formData = new FormData();

        formData.append("image", selectedFile);

        setUploadingImage(true);

        try {
            const response = await api.post(
                "/uploads/question",
                formData
            );

            return response.data.data.imageUrl;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            form.type === "MULTIPLE" &&
            form.correctAnswers.length < 2
        ) {
            setError(
                "Для вопроса с несколькими ответами выберите минимум два правильных варианта."
            );
            return;
        }

        if (form.correctAnswers.length === 0) {
            setError("Выберите правильный ответ.");
            return;
        }

        setLoading(true);

        try {
            const imageUrl = await uploadImage();

            const data = {
                text: form.text,
                imageUrl,
                type: form.type,
                optionA: form.optionA,
                optionB: form.optionB,
                optionC: form.optionC,
                optionD: form.optionD,
                correctAnswer: form.correctAnswers.join(","),
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

                setForm(EMPTY_FORM);
                setSelectedFile(null);
                setPreviewUrl("");
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

            <div className="form-group">
                <label>
                    Изображение вопроса
                </label>

                <div className="question-image-upload">
                    {previewUrl ? (
                        <div className="question-image-preview">
                            <img
                                src={previewUrl}
                                alt="Предпросмотр вопроса"
                            />

                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={handleRemoveImage}
                                disabled={loading || uploadingImage}
                            >
                                Удалить изображение
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="question-image"
                            className="image-upload-button"
                        >
                            <span className="image-upload-icon">
                                📁
                            </span>

                            <span>
                                Выбрать изображение
                            </span>

                            <small>
                                JPG, PNG или WEBP · до 5 МБ
                            </small>
                        </label>
                    )}

                    <input
                        id="question-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        hidden
                    />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="question-type">
                    Тип вопроса
                </label>

                <select
                    id="question-type"
                    name="type"
                    value={form.type}
                    onChange={handleTypeChange}
                >
                    <option value="SINGLE">
                        Один правильный ответ
                    </option>

                    <option value="MULTIPLE">
                        Несколько правильных ответов
                    </option>
                </select>
            </div>

            <div className="answers-heading">
                <h3>Варианты ответа</h3>

                <span>
                    {form.type === "SINGLE"
                        ? "Выберите один правильный вариант"
                        : "Выберите несколько правильных вариантов"}
                </span>
            </div>

            <div className="answers-grid">
                {[
                    ["A", "optionA", "Вариант A"],
                    ["B", "optionB", "Вариант B"],
                    ["C", "optionC", "Вариант C"],
                    ["D", "optionD", "Вариант D"]
                ].map(([letter, name, placeholder]) => {
                    const isCorrect =
                        form.correctAnswers.includes(letter);

                    return (
                        <div
                            className="answer-field"
                            key={letter}
                        >
                            <span className="answer-letter">
                                {letter}
                            </span>

                            <input
                                type="text"
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                required
                            />

                            <label
                                className="correct-answer-toggle"
                                title="Правильный ответ"
                            >
                                <input
                                    type={
                                        form.type === "MULTIPLE"
                                            ? "checkbox"
                                            : "radio"
                                    }
                                    name={
                                        form.type === "MULTIPLE"
                                            ? `correct-${letter}`
                                            : "correctAnswer"
                                    }
                                    checked={isCorrect}
                                    onChange={() =>
                                        handleCorrectAnswerChange(
                                            letter
                                        )
                                    }
                                />

                                <span>✓</span>
                            </label>
                        </div>
                    );
                })}
            </div>

            <div className="question-settings">
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
                    disabled={loading || uploadingImage}
                >
                    {uploadingImage
                        ? "Загрузка изображения..."
                        : loading
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
                        disabled={loading || uploadingImage}
                    >
                        Отмена
                    </button>
                )}
            </div>
        </form>
    );
}

export default QuestionForm;
