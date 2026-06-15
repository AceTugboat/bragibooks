import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useData } from '../context/DataContext';
import { bookApi, getErrorMessage } from '../api/services';

const ProcessingPage: React.FC = () => {
    const { books, refreshBooks } = useData();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [reprocessingId, setReprocessingId] = useState<number | null>(null);
    const [reprocessAsin, setReprocessAsin] = useState('');
    const [reprocessError, setReprocessError] = useState<string | null>(null);

    const handleReprocess = async (bookId: number, asin?: string) => {
        try {
            setReprocessingId(bookId);
            setReprocessError(null);
            await bookApi.reprocess(bookId, asin || undefined);
            await refreshBooks();
        } catch (err) {
            setReprocessError(getErrorMessage(err));
        } finally {
            setReprocessingId(null);
            setReprocessAsin('');
        }
    };

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
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                    <div className="flex-grow-1">
                                        <strong>{book.title}</strong>
                                        {book.authors[0] && (
                                            <span className="text-muted ms-2">
                                                {book.authors[0].first_name} {book.authors[0].last_name}
                                            </span>
                                        )}
                                        {book.status.message && (
                                            <p className="text-danger small mb-1 mt-1">{book.status.message}</p>
                                        )}
                                        {reprocessError && reprocessingId === book.id && (
                                            <p className="text-danger small mb-0">{reprocessError}</p>
                                        )}
                                        <div className="d-flex gap-2 mt-2 align-items-center flex-wrap">
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                style={{ maxWidth: 160 }}
                                                placeholder="New ASIN (optional)"
                                                value={reprocessingId === book.id ? reprocessAsin : ''}
                                                onChange={e => setReprocessAsin(e.target.value)}
                                                onFocus={() => setReprocessingId(book.id)}
                                            />
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                disabled={reprocessingId === book.id && reprocessAsin === '' && false}
                                                onClick={() => handleReprocess(book.id, reprocessAsin || undefined)}
                                            >
                                                {reprocessingId === book.id ? (
                                                    <span className="spinner-border spinner-border-sm" role="status" />
                                                ) : 'Re-process'}
                                            </button>
                                        </div>
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
