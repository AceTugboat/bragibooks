import React from 'react';
import type { Book } from '../types';

// Helper function to format runtime
const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

interface BookCardProps {
    book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    const authors = book.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ');
    const narrators = book.narrators.map(n => `${n.first_name} ${n.last_name}`).join(', ');
    const runtime = formatRuntime(book.runtime_length_minutes);

    return (
        <div className="row mb-4">
            <div className="col-md-3">
                <div className="card h-100">
                    <div className="card-body">
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                <img src={book.cover_image_link} className="img-fluid rounded" alt={book.title} />
                            </li>
                            <li><span className="fw-bold fs-5">Title:</span> <span className="fs-6">{book.title}</span></li>
                            {authors && <li><span className="fw-semibold">Author(s):</span> {authors}</li>}
                            {narrators && <li><span className="fw-semibold">Narrator(s):</span> {narrators}</li>}
                            {book.series && <li><span className="fw-semibold">Series:</span> {book.series}</li>}
                            <li><span className="fw-semibold">Length:</span> {runtime}</li>
                            <li><span className="fw-semibold">Type:</span> <span className="text-capitalize">{book.format_type}</span></li>
                            <li><span className="fw-semibold">Release Date:</span> {book.release_date}</li>
                            <li><span className="fw-semibold">Language:</span> <span className="text-capitalize">{book.lang}</span></li>
                            <li><span className="fw-semibold">Publisher:</span> <span className="text-capitalize">{book.publisher}</span></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-md-9">
                <div className="card h-100">
                    <div className="card-body">
                        <span className="fw-semibold fs-4 d-block mb-2">Description:</span>
                        {book.status.status === 'Error' ? (
                            <p className="text-danger">{book.status.message}</p>
                        ) : (
                            <p dangerouslySetInnerHTML={{ __html: book.long_desc }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
