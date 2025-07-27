import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


const getErrorMessage = (code: string) => {
    switch (code) {
        case "auth/invalid-email":
            return "L'adresse email est invalide.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Email ou mot de passe incorrect.";
        case "auth/email-already-in-use":
            return "Cette adresse email est déjà utilisée.";
        case "auth/weak-password":
            return "Le mot de passe doit contenir au moins 6 caractères.";
        default:
            return "Une erreur est survenue. Veuillez réessayer.";
    }
};

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(""); // Efface l’erreur à la saisie
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(""); // Efface l’erreur à la saisie
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/"); // Redirection vers la homepage
        } catch (err: any) {
            const code = err.code || "";
            setError(getErrorMessage(code));
        }
    };


    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", cred.user.uid), { tags: [] });
            navigate("/"); // Redirection vers la homepage

        } catch (err: any) {
            const code = err.code || "";
            setError(getErrorMessage(code));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => {
                            setMode("login");
                            setError("");
                        }}
                    >
                        Connexion
                    </button>
                    <button
                        className={`auth-tab ${mode === "register" ? "active" : ""}`}
                        onClick={() => {
                            setMode("register");
                            setError("");
                        }}
                    >
                        Inscription
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                {mode === "login" && (
                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            required
                        />
                        <button type="submit">Se connecter</button>
                    </form>
                )}

                {mode === "register" && (
                    <form className="auth-form" onSubmit={handleRegister}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError("");
                            }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            required
                        />
                        <button type="submit">S'inscrire</button>
                    </form>
                )}
            </div>
        </div>
    );


};

export default AuthPage;
