import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import QuizEditor from "./pages/QuizEditor";
import Room from "./pages/Room";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import JoinGame from "./pages/JoinGame";
import History from "./pages/History";

import MainLayout from "./layouts/MainLayout";
import GameLayout from "./layouts/GameLayout";


function App() {
    return (
        <Routes>
            
            {/* Public pages */}

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/join"
                element={<JoinGame />}
            />

            {/* Authenticated user pages */}

            <Route element={<MainLayout />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/quiz/:id"
                    element={<QuizEditor />}
                />

                <Route
                    path="/history" 
                    element={<History />} />

            </Route>


            {/* Game pages */}

            <Route element={<GameLayout />}>

                <Route
                    path="/room/:code"
                    element={<Room />}
                />

                <Route
                    path="/game/:code"
                    element={<Game />}
                />

                <Route
                    path="/leaderboard/:code"
                    element={<Leaderboard />}
                />

            </Route>


            {/* 404 */}

            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
}

export default App;
