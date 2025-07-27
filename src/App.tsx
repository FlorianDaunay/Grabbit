import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./firebase/useAuth";

const App: React.FC = () => {
    const { user } = useAuth();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route
                    path="/"
                    element={user ? <HomePage /> : <Navigate to="/login" />}
                />

            </Routes>
        </BrowserRouter>
    );
};

export default App;
