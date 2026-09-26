import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authService from "../services/auth.service";

import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            setLoading(true);

            await authService.register({
                username,
                email,
                password,
            });

            setSuccess(
                "Регистрация прошла успешно. Сейчас вы будете перенаправлены на страницу входа."
            );

            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Ошибка регистрации"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">

                <div className="register-brand">
                    <div className="register-brand-icon">
                        🎯
                    </div>

                    <span>Quiz App</span>
                </div>

                <div className="register-card">

                    <div className="register-card-header">
                        <div className="register-icon">
                            ✨
                        </div>

                        <h1>
                            Создайте аккаунт
                        </h1>

                        <p>
                            Зарегистрируйтесь, чтобы создавать
                            собственные викторины.
                        </p>
                    </div>

                    <form
                        className="register-form"
                        onSubmit={handleRegister}
                    >

                        <div className="register-field">
                            <label htmlFor="register-username">
                                Имя пользователя
                            </label>

                            <input
                                id="register-username"
                                type="text"
                                placeholder="Введите ваше имя"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="register-email">
                                Email
                            </label>

                            <input
                                id="register-email"
                                type="email"
                                placeholder="Введите ваш email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="register-password">
                                Пароль
                            </label>

                            <input
                                id="register-password"
                                type="password"
                                placeholder="Придумайте пароль"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="register-error">
                                <span>!</span>

                                <p>
                                    {error}
                                </p>
                            </div>
                        )}

                        {success && (
                            <div className="register-success">
                                <span>✓</span>

                                <p>
                                    {success}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading || !!success}
                        >
                            {loading ? (
                                <>
                                    <span className="register-spinner"></span>
                                    Регистрируем...
                                </>
                            ) : (
                                <>
                                    Зарегистрироваться
                                    <span className="register-button-arrow">
                                        →
                                    </span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="register-footer">
                        <span>
                            Уже есть аккаунт?
                        </span>

                        <Link to="/">
                            Войти
                        </Link>
                    </div>

                </div>

                <p className="register-footer-hint">
                    После регистрации вы сможете создавать
                    и запускать викторины
                </p>

            </div>
        </div>
    );
}

export default Register;
