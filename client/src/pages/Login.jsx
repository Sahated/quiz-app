import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authService from "../services/auth.service";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const response = await authService.login({
                email,
                password,
            });

            localStorage.setItem(
                "token",
                response.data.token
            );

            login(response.data.user);

            navigate("/dashboard");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Ошибка авторизации"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                <div className="login-brand">
                    <div className="login-brand-icon">
                        🎯
                    </div>

                    <span>Quiz App</span>
                </div>

                <div className="login-card">

                    <div className="login-card-header">
                        <div className="login-icon">
                            👋
                        </div>

                        <h1>
                            С возвращением!
                        </h1>

                        <p>
                            Войдите в аккаунт, чтобы создавать
                            и запускать викторины.
                        </p>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleLogin}
                    >

                        <div className="login-field">
                            <label htmlFor="login-email">
                                Email
                            </label>

                            <input
                                id="login-email"
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

                        <div className="login-field">
                            <label htmlFor="login-password">
                                Пароль
                            </label>

                            <input
                                id="login-password"
                                type="password"
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                <span>!</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="login-spinner"></span>
                                    Входим...
                                </>
                            ) : (
                                <>
                                    Войти
                                    <span className="login-button-arrow">
                                        →
                                    </span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="login-footer">
                        <span>
                            Нет аккаунта?
                        </span>

                        <Link to="/register">
                            Зарегистрироваться
                        </Link>
                    </div>

                </div>

                <p className="login-footer-hint">
                    Создавайте викторины и проводите игры
                    в реальном времени
                </p>

            </div>
        </div>
    );
}

export default Login;
