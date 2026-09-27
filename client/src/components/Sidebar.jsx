import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">

            <NavLink to="/dashboard">
                <span className="sidebar-icon">📝</span>
                <span>Мои квизы</span>
            </NavLink>

            <NavLink to="/history">
                <span className="sidebar-icon">📊</span>
                <span>История</span>
            </NavLink>

        </aside>
    );
}

export default Sidebar;
