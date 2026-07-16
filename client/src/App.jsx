import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import QuizEditor from "./pages/QuizEditor";
import Room from "./pages/Room";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

import MainLayout from "./layouts/MainLayout";

function App() {
    return (
        <Routes>

            {/* Public Pages*/}

            <Route path="/" element={<Login />} />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* Private part of the app */}

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
                    path="/room/:code"
                    element={<Room />}
                />

                <Route
                    path="/game/:code"
                    element={<Game />}
                />

                <Route
                    path="/leaderboard"
                    element={<Leaderboard />}
                />

            </Route>

            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
}

export default App;