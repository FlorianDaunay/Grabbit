import React from "react";
import { Snippet } from "../types/Snippet";

interface Props {
    snippet: Snippet;
    onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

const SnippetCard: React.FC<Props> = ({ snippet, onToggleFavorite }) => {
    return (
        <div className="snippet-card">
            <h3>{snippet.title}</h3>
            <button
                className={`favorite-button ${snippet.isFavorite ? "active" : ""}`}
                onClick={() => onToggleFavorite?.(snippet.id!, snippet.isFavorite ?? false)}
            >
                {snippet.isFavorite ? "❤️" : "🤍"}
            </button>
            <pre><code>{snippet.code}</code></pre>
            <div className="tags">
                {snippet.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                ))}
            </div>
        </div>
    );
};

export default SnippetCard;
