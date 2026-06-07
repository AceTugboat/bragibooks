import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';

interface LibraryBookCardProps {
    book: Book;
    libraryState?: {
        searchQuery: string;
        sortBy: string;
        itemsPerPage: number;
        currentPage: number;
    };
}

const LibraryBookCard: React.FC<LibraryBookCardProps> = ({ book, libraryState }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/books/${book.id}`, { state: libraryState });
    };

    return (
        <div className="library-book-card" onClick={handleClick} role="button" tabIndex={0}>
            <div className="library-book-cover">
                <img
                    src={book.cover_image_link}
                    alt={book.title}
                    onError={(e) => {
                        e.currentTarget.src = '/static/images/cover_not_available.jpg';
                    }}
                />
            </div>
            <div className="library-book-title" title={book.title}>
                {book.title}
            </div>
        </div>
    );
};

export default LibraryBookCard;
