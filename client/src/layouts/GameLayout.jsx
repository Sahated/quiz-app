import { Outlet } from "react-router-dom";

import "./GameLayout.css";

function GameLayout() {
    return (
        <div className="game-layout">
            <Outlet />
        </div>
    );
}

export default GameLayout;
