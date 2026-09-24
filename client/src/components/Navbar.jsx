import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

function Navbar() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="logo">
                🎯 Quiz App
            </div>

            <div className="user">
                <span>
                    👤 {user?.username || "Пользователь"}
                </span>

                <button onClick={handleLogout}>
                    Выйти
                </button>
            </div>
        </header>
    );
}

export default Navbar;
