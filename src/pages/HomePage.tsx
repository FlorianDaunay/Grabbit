import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from "firebase/auth";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    getDoc,
    arrayUnion,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Snippet } from "../types/Snippet";
import "../style.css";

const HomePage: React.FC = () => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [userTags, setUserTags] = useState<string[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [filter, setFilter] = useState("Tous");
    const [search, setSearch] = useState("");

    const [title, setTitle] = useState("");
    const [tags, setTags] = useState("");
    const [code, setCode] = useState("");
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (!u) {
                navigate("/login");
                return;
            }
            setUser(u);
            await fetchSnippets(u.uid);
            await fetchUserData(u.uid);
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchSnippets = async (uid: string) => {
        const q = query(collection(db, "snippets"), where("uid", "==", uid));
        const res = await getDocs(q);
        setSnippets(res.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Snippet)));
    };

    const fetchUserData = async (uid: string) => {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        const data = snap.data();
        if (data) {
            setUserTags(data.tags || []);
            setFavorites(data.favorites || []);
        }
    };

    const handleAddSnippet = async () => {
        if (!user || !title || !code) return;
        const tagsArray = tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        const newSnippet = {
            uid: user.uid,
            title,
            tags: tagsArray,
            code,
            createdAt: Date.now(),
        };

        const docRef = await addDoc(collection(db, "snippets"), newSnippet);

        setSnippets([...snippets, { id: docRef.id, ...newSnippet }]);
        setTitle("");
        setTags("");
        setCode("");

        const userRef = doc(db, "users", user.uid);
        for (const tag of tagsArray) {
            await updateDoc(userRef, {
                tags: arrayUnion(tag),
            });
        }

        fetchUserData(user.uid);
    };

    const toggleFavorite = async (id: string) => {
        if (!user) return;
        const ref = doc(db, "users", user.uid);
        const isFav = favorites.includes(id);
        const updated = isFav
            ? favorites.filter((f) => f !== id)
            : [...favorites, id];

        await updateDoc(ref, { favorites: updated });
        setFavorites(updated);
    };

    const isVisible = (s: Snippet) => {
        const matchesSearch =
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

        const matchesFilter =
            filter === "Tous" ||
            (filter === "Favoris" && favorites.includes(s.id)) ||
            s.tags.includes(filter);

        return matchesSearch && matchesFilter;
    };

    const filteredSnippets = snippets.filter(isVisible);

    return (
        <div className="app">
            <div className="sidebar">
                <h2>Filtres</h2>
                {["Tous", "Favoris", ...userTags].map((tag) => (
                    <button
                        key={tag}
                        className={filter === tag ? "active" : ""}
                        onClick={() => setFilter(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <div className="main">
                <div className="topbar">
                    <input
                        className="search"
                        placeholder="🔍 Rechercher"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setShowModal(true)}>+ Ajouter un snippet</button>
                        <button onClick={() => signOut(auth)}>Déconnexion</button>
                    </div>
                </div>

                <h2>Snippets</h2>

                {
                    <p style={{ marginTop: "-1rem", marginBottom: "1rem", color: "#666" }}>
                        {filteredSnippets.length} snippet{filteredSnippets.length > 1 ? "s" : ""} trouvé{filteredSnippets.length > 1 ? "s" : ""}
                    </p>
                }



                {filteredSnippets.map((s) => (
                    <div key={s.id} className="snippet-card">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h3>{s.title}</h3>
                            <button onClick={() => toggleFavorite(s.id)} style={{ all: "unset", cursor: "pointer" }}>
                                {favorites.includes(s.id) ? "❤️" : "🤍"}
                            </button>
                        </div>
                        <div className="tags">
                            {s.tags.map((tag) => (
                                <span key={tag} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <pre>{s.code}</pre>
                    </div>
                ))}

                {showModal && (
                    <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close" onClick={() => setShowModal(false)}>✖</button>
                            <h2>Nouveau snippet</h2>

                            <div className="form-group">
                                <label htmlFor="title">Titre</label>
                                <input
                                    id="title"
                                    placeholder="Ex: debounce"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags">Tags (séparés par des virgules)</label>
                                <input
                                    id="tags"
                                    placeholder="Ex: JavaScript, utils"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="code">Code</label>
                                <textarea
                                    id="code"
                                    rows={8}
                                    placeholder="// Ton code ici..."
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>

                            <div className="actions">
                                <button onClick={() => {
                                    handleAddSnippet();
                                    setShowModal(false);
                                }}>
                                    Sauvegarder
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
