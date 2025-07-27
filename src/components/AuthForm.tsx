import React, { useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

interface Props {
    isSignUp: boolean;
    onSuccess: () => void;
}

const AuthForm: React.FC<Props> = ({ isSignUp, onSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isSignUp) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", cred.user.uid), {
                    tags: [],
                    favorites: [],
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "2rem auto" }}>
            <h2>{isSignUp ? "Créer un compte" : "Connexion"}</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            /><br />

            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            /><br />

            <button type="submit">{isSignUp ? "S'inscrire" : "Se connecter"}</button>

            <br />
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
};

export default AuthForm;
