import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useData } from '../context/DataContext';

const ProcessingPage: React.FC = () => {
    const { books, refreshBooks } = useData();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (books.processing.length > 0) {
            intervalRef.current = setInterval(refreshBooks, 10_000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [books.processing.length, refreshBooks]);

    const recentlyCompleted = [...books.done]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10);

    return (
        <div className="container-fluid p-4">
            <PageHeader title="Processing" />

            {/* Currently Processing */}
            <section className="mb-5">
                <h5 className="mb-3">Currently Processing</h5>
                {books.processing.length === 0 ? (
                    <p className="text-muted">Nothing processing right now.</p>
                ) : (
                    <div className="list-group">
                        {books.processing.map(book => (
                            <div key={book.id} className="list-group-item d-flex align-items-center gap-3">
                                <div className="spinner-border spinner-border-sm text-primary flex-shrink-0" role="status">
                                    <span className="visually-hidden">Processing…</span>
                                </div>
                                <div className="flex-grow-1">
                                    <strong>{book.title}</strong>
                                    {book.authors[0] && (
                                        <span className="text-muted ms-2">
                                            {book.authors[0].first_name} {book.authors[0].last_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Errors */}
            <section className="mb-5">
                <h5 className="mb-3">Errors</h5>
                {books.error.length === 0 ? (
                    <p className="text-muted">No errors.</p>
                ) : (
                    <div className="list-group">
                        {books.error.map(book => (
                            <div key={book.id} className="list-group-item">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <strong>{book.title}</strong>
                                        {book.authors[0] && (
                                            <span className="text-muted ms-2">
                                                {book.authors[0].first_name} {book.authors[0].last_name}
                                            </span>
                                        )}
                                        {book.status.message && (
                                            <p className="text-danger small mb-0 mt-1">{book.status.message}</p>
                                        )}
                                    </div>
                                    <div className="d-flex gap-2 ms-3 flex-shrink-0">
                                        <button className="btn btn-sm btn-outline-primary" disabled>
                                            Re-process
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger" disabled>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recently Completed */}
            <section>
                <h5 className="mb-3">Recently Completed</h5>
                {recentlyCompleted.length === 0 ? (
                    <p className="text-muted">No completed books yet.</p>
                ) : (
                    <div className="list-group">
                        {recentlyCompleted.map(book => (
                            <Link
                                key={book.id}
                                to={`/books/${book.id}`}
                                className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                            >
                                {book.cover_image_link && (
                                    <img
                                        src={book.cover_image_link}
                                        alt=""
                                        width={40}
                                        height={40}
                                        style={{ objectFit: 'cover', borderRadius: 4 }}
                                    />
                                )}
                                <div>
                                    <strong>{book.title}</strong>
                                    {book.authors[0] && (
                                        <span className="text-muted ms-2">
                                            {book.authors[0].first_name} {book.authors[0].last_name}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default ProcessingPage;
