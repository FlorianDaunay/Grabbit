export interface Snippet {
    id: string;
    uid: string;
    title: string;
    tags: string[];
    code: string;
    createdAt: number;
    isFavorite?: boolean;
}
