import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

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
                password
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
            <Card>

                <h1>Quiz App</h1>
                <p>Регистрация</p>

                <form onSubmit={handleRegister}>

                    <Input
                        type="text"
                        placeholder="Имя пользователя"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        required
                    />

                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    {
                        error &&
                        <p className="error">
                            {error}
                        </p>
                    }

                    {
                        success &&
                        <p className="success">
                            {success}
                        </p>
                    }

                    <Button
                        type="submit"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Регистрируем..."
                                : "Зарегистрироваться"
                        }
                    </Button>

                </form>

                <div className="register-footer">
                    Уже есть аккаунт?
                    <Link to="/">
                        Войти
                    </Link>
                </div>

            </Card>
        </div>
    );
}

export default Register;
