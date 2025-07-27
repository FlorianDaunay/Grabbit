import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./firebase/useAuth";

const App: React.FC = () => {
    const { user } = useAuth();
    console.log("here in app");
    return (
        <HashRouter>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route
                    path="/"
                    element={user ? <HomePage /> : <Navigate to="/login" />}
                />

            </Routes>
        </HashRouter>
    );
};

export default App;
