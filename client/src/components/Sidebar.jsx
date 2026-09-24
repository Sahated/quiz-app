import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <NavLink to="/dashboard">
                📝 Мои квизы
            </NavLink>
        </aside>
    );
}

export default Sidebar;