import React from "react";
import { Snippet } from "../types/Snippet";
import SnippetCard from "./SnippetCard";

interface Props {
    snippets: Snippet[];
}

const SnippetList: React.FC<Props> = ({ snippets }) => {
    return (
        <div className="snippet-list">
            {snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
        </div>
    );
};

export default SnippetList;
