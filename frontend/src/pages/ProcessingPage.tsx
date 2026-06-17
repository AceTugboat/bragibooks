import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useData } from '../context/DataContext';
import { bookApi, getErrorMessage } from '../api/services';

const ProcessingPage: React.FC = () => {
    const { books, refreshBooks } = useData();
    const [reprocessingId, setReprocessingId] = useState<number | null>(null);
    const [reprocessAsin, setReprocessAsin] = useState('');
    const [reprocessError, setReprocessError] = useState<string | null>(null);
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

    // 1-second poll while this page is open and books are processing
    useEffect(() => {
        if (books.processing.length === 0) return;
        const id = setInterval(refreshBooks, 1_000);
        return () => clearInterval(id);
    }, [books.processing.length, refreshBooks]);

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
                        {books.processing.map(book => {
                            const elapsed = Math.floor((Date.now() - new Date(book.updated_at).getTime()) / 1000);
                            const elapsedStr = elapsed < 60
                                ? `${elapsed}s`
                                : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
                            return (
                                <div key={book.id} className="list-group-item">
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <div className="flex-grow-1">
                                            <div className="fw-bold">{book.title}</div>
                                            {book.authors[0] && (
                                                <div className="text-muted small">
                                                    {book.authors[0].first_name} {book.authors[0].last_name}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-muted small flex-shrink-0">{elapsedStr}</span>
                                    </div>
                                    <div className="progress mb-1" style={{ height: 6 }}>
                                        <div
                                            className="progress-bar progress-bar-striped progress-bar-animated"
                                            role="progressbar"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    {book.status.message && (
                                        <div className="text-muted small mt-1">
                                            <i className="fas fa-circle-info me-1" />
                                            {book.status.message}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                            <>
                                                <div
                                                    className="text-danger small mt-1 d-flex align-items-center gap-1"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setExpandedLogs(prev => {
                                                        const next = new Set(prev);
                                                        next.has(book.id) ? next.delete(book.id) : next.add(book.id);
                                                        return next;
                                                    })}
                                                >
                                                    <i className={`fas fa-angle-${expandedLogs.has(book.id) ? 'up' : 'down'}`} />
                                                    {expandedLogs.has(book.id) ? 'Hide logs' : 'Show logs'}
                                                </div>
                                                {expandedLogs.has(book.id) && (
                                                    <pre
                                                        className="text-danger small bg-danger bg-opacity-10 rounded p-2 mt-1"
                                                        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 300, overflowY: 'auto', fontSize: '0.75rem' }}
                                                    >
                                                        {book.status.message}
                                                    </pre>
                                                )}
                                            </>
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
