import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <NavLink to="/dashboard">
                🏠 Главная
            </NavLink>

            <NavLink to="/dashboard">
                📝 Мои квизы
            </NavLink>

            <NavLink to="/leaderboard">
                🏆 История
            </NavLink>
        </aside>
    );
}

export default Sidebar;
