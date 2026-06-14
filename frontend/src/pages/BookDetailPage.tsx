import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import type { Book } from '../types';
import { bookApi, getErrorMessage } from '../api/services';
import { useData } from '../context/DataContext';

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { refreshBooks } = useData();

    useEffect(() => {
        if (id) {
            loadBook(id);
        }
    }, [id]);

    const loadBook = async (bookId: string) => {
        try {
            setLoading(true);
            const data = await bookApi.getById(bookId);
            setBook(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLibrary = () => {
        // Navigate back with preserved state
        navigate('/', { state: location.state });
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await bookApi.delete(id!);
            await refreshBooks();
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err));
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleFixMetadata = () => {
        // TODO: Implement fix metadata functionality
        console.log('Fix metadata for book:', id);
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="container my-5">
                <div className="alert alert-danger" role="alert">
                    {error || 'Book not found'}
                </div>
                <button className="btn btn-primary" onClick={handleBackToLibrary}>
                    <i className="fa-solid fa-arrow-left me-2"></i>
                    Back to Library
                </button>
            </div>
        );
    }

    const formatRuntime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatAuthors = (authors: typeof book.authors): string => {
        return authors.map(a => `${a.first_name} ${a.last_name}`).join(', ');
    };

    const formatNarrators = (narrators: typeof book.narrators): string => {
        return narrators.map(n => `${n.first_name} ${n.last_name}`).join(', ');
    };

    return (
        <>
        <div className="book-detail-page">
            <PageHeader
                title={book.title}
                startAction={
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleBackToLibrary}
                        title="Back to Library"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                }
            >
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => setShowDeleteModal(true)}
                        title="Delete Book"
                    >
                        <i className="fa-solid fa-trash me-1"></i>
                        Delete
                    </button>
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleFixMetadata}
                        title="Fix Metadata"
                    >
                        <i className="fa-solid fa-wrench me-1"></i>
                        Fix Metadata
                    </button>
                </div>
            </PageHeader>

            <div className="book-detail-content">
                <div className="container-fluid px-4 py-4">
                    <div className="row">
                        {/* Cover Image */}
                        <div className="col-12 col-md-4 col-lg-3 mb-4">
                            <div className="book-detail-cover">
                                <img
                                    src={book.cover_image_link}
                                    alt={book.title}
                                    className="img-fluid rounded shadow"
                                    onError={(e) => {
                                        e.currentTarget.src = '/static/images/cover_not_available.jpg';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Book Information */}
                        <div className="col-12 col-md-8 col-lg-9">
                            {/* Basic Info */}
                            <div className="mb-4">
                                <h2 className="mb-2">{book.title}</h2>
                                {book.authors && book.authors.length > 0 && (
                                    <p className="text-muted mb-1">
                                        <i className="fa-solid fa-user me-2"></i>
                                        <strong>Author{book.authors.length > 1 ? 's' : ''}:</strong> {formatAuthors(book.authors)}
                                    </p>
                                )}
                                {book.narrators && book.narrators.length > 0 && (
                                    <p className="text-muted mb-1">
                                        <i className="fa-solid fa-microphone me-2"></i>
                                        <strong>Narrator{book.narrators.length > 1 ? 's' : ''}:</strong> {formatNarrators(book.narrators)}
                                    </p>
                                )}
                                {book.series && (
                                    <p className="text-muted mb-1">
                                        <i className="fa-solid fa-book-open me-2"></i>
                                        <strong>Series:</strong> {book.series}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            {(book.long_desc || book.short_desc) && (
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title">Description</h5>
                                        <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                                            {book.long_desc || book.short_desc}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="row g-3">
                                {/* Audio Details */}
                                <div className="col-12 col-lg-6">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                <i className="fa-solid fa-headphones me-2"></i>
                                                Audio Details
                                            </h5>
                                            <ul className="list-unstyled mb-0">
                                                <li className="mb-2">
                                                    <strong>Format:</strong> {book.format_type || 'Unknown'}
                                                </li>
                                                <li className="mb-2">
                                                    <strong>Runtime:</strong> {formatRuntime(book.runtime_length_minutes)}
                                                </li>
                                                <li className="mb-2">
                                                    <strong>Converted:</strong> {book.converted ? 'Yes' : 'No'}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Publishing Info */}
                                <div className="col-12 col-lg-6">
                                    <div className="card h-100">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                <i className="fa-solid fa-building me-2"></i>
                                                Publishing Info
                                            </h5>
                                            <ul className="list-unstyled mb-0">
                                                {book.publisher && (
                                                    <li className="mb-2">
                                                        <strong>Publisher:</strong> {book.publisher}
                                                    </li>
                                                )}
                                                {book.release_date && (
                                                    <li className="mb-2">
                                                        <strong>Release Date:</strong> {new Date(book.release_date).toLocaleDateString()}
                                                    </li>
                                                )}
                                                {book.lang && (
                                                    <li className="mb-2">
                                                        <strong>Language:</strong> {book.lang}
                                                    </li>
                                                )}
                                                {book.asin && (
                                                    <li className="mb-2">
                                                        <strong>ASIN:</strong> {book.asin}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* File Info */}
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">
                                                <i className="fa-solid fa-folder me-2"></i>
                                                File Information
                                            </h5>
                                            <ul className="list-unstyled mb-0">
                                                {book.src_path && (
                                                    <li className="mb-2">
                                                        <strong>Source Path:</strong> <code className="text-break">{book.src_path}</code>
                                                    </li>
                                                )}
                                                {book.dest_path && (
                                                    <li className="mb-2">
                                                        <strong>Destination Path:</strong> <code className="text-break">{book.dest_path}</code>
                                                    </li>
                                                )}
                                                <li className="mb-2">
                                                    <strong>Status:</strong> <span className="badge bg-success">{book.status ? book.status.status : 'Unknown'}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {showDeleteModal && (
                <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Delete Book</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                />
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{book.title}</strong>?</p>
                                <p className="text-muted mb-0">This removes the record from Bragibooks but does not delete audio files from disk.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                                            Deleting...
                                        </>
                                    ) : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        )}
        </>
    );
};

export default BookDetailPage;
