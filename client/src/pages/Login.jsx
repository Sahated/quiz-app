import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

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
                password
            });

            localStorage.setItem(
                "token",
                response.data.token
            );
            
            login(response.data.user);

            navigate("/dashboard");
        }

        catch (err) {
            setError(
                err.response?.data?.message ||
                "Ошибка авторизации"
            );
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Card>
                <h1>Quiz App</h1>
                <p>Вход в систему</p>

                <form onSubmit={handleLogin}>

                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    {
                        error &&
                        <p className="error">
                            {error}
                        </p>
                    }

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Входим..."
                                : "Войти"
                        }
                    </Button>
                </form>

                <div className="login-footer">
                    Нет аккаунта?
                    <Link to="/register">
                        Регистрация
                    </Link>
                </div>
            </Card>
        </div>
    );
}

export default Login;
