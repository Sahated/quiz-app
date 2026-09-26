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
            <div
                className="navbar-brand"
                onClick={() => navigate("/dashboard")}
            >
                <div className="navbar-brand-icon">
                    🎯
                </div>

                <span>Quiz App</span>
            </div>

            <div className="navbar-right">
                <div className="navbar-user">
                    <div className="navbar-user-avatar">
                        {(user?.username || "П")[0].toUpperCase()}
                    </div>

                    <div className="navbar-user-info">
                        <span className="navbar-user-label">
                            Вы вошли как
                        </span>

                        <span className="navbar-user-name">
                            {user?.username || "Пользователь"}
                        </span>
                    </div>
                </div>

                <div className="navbar-divider"></div>

                <button
                    className="navbar-logout"
                    type="button"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    Выйти
                </button>
            </div>
        </header>
    );
}

export default Navbar;
