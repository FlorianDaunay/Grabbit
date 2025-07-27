import React, { useState } from "react";
import { addDoc, collection, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../firebase/useAuth";
import "../style.css";

interface Props {
    onClose: () => void;
}

const AddSnippetForm: React.FC<Props> = ({ onClose }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [code, setCode] = useState("");
    const [errors, setErrors] = useState<{ title?: string; code?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: { title?: string; code?: string } = {};
        if (!title.trim()) newErrors.title = "Le titre est requis.";
        if (!code.trim()) newErrors.code = "Le code est requis.";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const tagsArray = tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0);

        const snippet = {
            title,
            code,
            tags: tagsArray,
            createdAt: new Date(),
            isFavorite: false,
        };

        const snippetsRef = collection(db, "users", user!.uid, "snippets");
        await addDoc(snippetsRef, snippet);

        const userRef = doc(db, "users", user!.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { tags: tagsArray, favorites: [] });
        } else {
            const userData = userSnap.data();
            const newTags = [...new Set([...(userData.tags || []), ...tagsArray])];
            await updateDoc(userRef, { tags: newTags });
        }

        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <button className="close" onClick={onClose}>
                    ✕
                </button>
                <h2>Nouveau snippet</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Titre</label>
                        <input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: debounce"
                        />
                        {errors.title && <span className="error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">Tags (séparés par des virgules)</label>
                        <input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Ex: JavaScript, utils"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="code">Code</label>
                        <textarea
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="// Ton code ici..."
                        />
                        {errors.code && <span className="error">{errors.code}</span>}
                    </div>

                    <div className="actions">
                        <button type="submit">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSnippetForm;