import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import type { Author, Book, Chapter, Narrator } from '../types';
import { StatusChoice } from '../types';
import { bookApi, getErrorMessage } from '../api/services';
import { useData } from '../context/DataContext';

function parseChapterFile(text: string, filename: string): Chapter[] {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const isCsv = filename.toLowerCase().endsWith('.csv');
    const results: Chapter[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (isCsv) {
            if (i === 0 && /^(timestamp|time|index)/i.test(line)) continue;
            const commaIdx = line.indexOf(',');
            if (commaIdx === -1) throw new Error(`Invalid CSV on line ${i + 1}: "${line}"`);
            const timestamp = line.slice(0, commaIdx).trim().replace(/^"|"$/g, '');
            const name = line.slice(commaIdx + 1).trim().replace(/^"|"$/g, '');
            results.push({ index: results.length + 1, timestamp, name });
        } else {
            const spaceIdx = line.indexOf(' ');
            if (spaceIdx === -1) throw new Error(`Invalid chapter line ${i + 1}: "${line}"`);
            results.push({ index: results.length + 1, timestamp: line.slice(0, spaceIdx), name: line.slice(spaceIdx + 1).trim() });
        }
    }

    if (results.length === 0) throw new Error('No chapters found in file');
    return results;
}

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteFiles, setDeleteFiles] = useState(false);
    const [showReprocessModal, setShowReprocessModal] = useState(false);
    const [reprocessAsin, setReprocessAsin] = useState('');
    const [reprocessing, setReprocessing] = useState(false);
    const [showMetaModal, setShowMetaModal] = useState(false);
    const [metaForm, setMetaForm] = useState({ title: '', author: '', narrator: '', year: '', series: '', genre: '', description: '' });
    const [savingMeta, setSavingMeta] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [chaptersOpen, setChaptersOpen] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [savingChapters, setSavingChapters] = useState(false);
    const [chapterError, setChapterError] = useState<string | null>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [chapterSaveMessage, setChapterSaveMessage] = useState<string | null>(null);
    const [importChapterError, setImportChapterError] = useState<string | null>(null);
    const chapterFileInputRef = useRef<HTMLInputElement>(null);
    const [showCoverModal, setShowCoverModal] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [replacingCover, setReplacingCover] = useState(false);
    const [coverError, setCoverError] = useState<string | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
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
            await bookApi.delete(id!, deleteFiles);
            await refreshBooks();
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err));
            setShowDeleteModal(false);
        } finally {
            setDeleting(false);
            setDeleteFiles(false);
        }
    };

    const handleReprocess = async () => {
        try {
            setReprocessing(true);
            await bookApi.reprocess(id!, reprocessAsin || undefined);
            await refreshBooks();
            setShowReprocessModal(false);
            setReprocessAsin('');
            if (id) loadBook(id);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setReprocessing(false);
        }
    };

    const handleFixMetadata = () => {
        setMetaForm({
            title: book?.title ?? '',
            author: book?.authors?.map((a: Author) => `${a.first_name} ${a.last_name}`).join(', ') ?? '',
            narrator: book?.narrators?.map((n: Narrator) => `${n.first_name} ${n.last_name}`).join(', ') ?? '',
            year: '',
            series: book?.series ?? '',
            genre: '',
            description: book?.long_desc ?? book?.short_desc ?? '',
        });
        setShowMetaModal(true);
    };

    const handleLoadChapters = async () => {
        if (!id) return;
        setChaptersOpen(o => !o);
        if (!chaptersOpen && chapters.length === 0) {
            setLoadingChapters(true);
            try {
                const data = await bookApi.getChapters(id);
                setChapters(data);
            } catch (err) {
                setChapterError(getErrorMessage(err));
            } finally {
                setLoadingChapters(false);
            }
        }
    };

    const handleSaveChapters = async () => {
        if (!id) return;
        setSavingChapters(true);
        setChapterSaveMessage(null);
        try {
            const result = await bookApi.saveChapters(id, chapters);
            setChapterError(null);
            if (result?.message) setChapterSaveMessage(result.message);
        } catch (err) {
            setChapterError(getErrorMessage(err));
        } finally {
            setSavingChapters(false);
        }
    };

    const handleAddChapter = () => {
        setChapters(prev => [...prev, { index: prev.length + 1, timestamp: '00:00:00.000', name: '' }]);
    };

    const handleImportChapters = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const parsed = parseChapterFile(evt.target?.result as string, file.name);
                setChapters(parsed);
                setImportError(null);
                setChapterError(null);
                setChaptersOpen(true);
            } catch (err) {
                setImportError(getErrorMessage(err));
            }
        };
        reader.readAsText(file);
    };

    const handleReplaceUpload = async () => {
        if (!id || !coverFile) return;
        setReplacingCover(true);
        setCoverError(null);
        try {
            await bookApi.replaceCoverUpload(id, coverFile);
            setShowCoverModal(false);
            setCoverFile(null);
            setCoverPreviewUrl(null);
        } catch (err) {
            setCoverError(getErrorMessage(err));
        } finally {
            setReplacingCover(false);
        }
    };

    const handleRefetchCover = async () => {
        if (!id) return;
        setReplacingCover(true);
        setCoverError(null);
        try {
            await bookApi.replaceCoverRefetch(id);
            setShowCoverModal(false);
        } catch (err) {
            setCoverError(getErrorMessage(err));
        } finally {
            setReplacingCover(false);
        }
    };

    const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setCoverFile(file);
        if (file) {
            setCoverPreviewUrl(URL.createObjectURL(file));
        } else {
            setCoverPreviewUrl(null);
        }
    };

    const handleSaveMeta = async () => {
        if (!id || !book) return;
        setSavingMeta(true);
        try {
            const updated = await bookApi.updateMetadata(id, {
                title: metaForm.title || undefined,
                author: metaForm.author || undefined,
                narrator: metaForm.narrator || undefined,
                year: metaForm.year ? parseInt(metaForm.year, 10) : undefined,
                series: metaForm.series || undefined,
                genre: metaForm.genre || undefined,
                description: metaForm.description || undefined,
            });
            setBook(updated);
            setShowMetaModal(false);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSavingMeta(false);
        }
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

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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
                    {book.status.status === StatusChoice.DONE && (
                        <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={() => setShowReprocessModal(true)}
                            title="Re-process"
                        >
                            <i className="fa-solid fa-rotate me-1"></i>
                            Re-process
                        </button>
                    )}
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
                                {book.status.status === StatusChoice.DONE && (
                                    <button
                                        className="btn btn-sm btn-outline-secondary w-100 mt-2"
                                        onClick={() => setShowCoverModal(true)}
                                    >
                                        <i className="fa-solid fa-image me-1" />
                                        Replace Cover
                                    </button>
                                )}
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
                                {!book.output_file_exists && book.dest_path && (
                                    <div className="alert alert-warning py-2 px-3 mt-2 mb-0 d-flex align-items-center gap-2">
                                        <i className="fas fa-triangle-exclamation" />
                                        <span className="small">Output file <code>{book.dest_path.split('/').pop()}</code> was not found on disk.</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {(book.long_desc || book.short_desc) && (
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title">Description</h5>
                                        <div
                                            className="card-text"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(book.long_desc || book.short_desc) }}
                                        />
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
                                                {book.audio_bitrate && (
                                                    <li className="mb-2">
                                                        <strong>Bitrate:</strong> {book.audio_bitrate} kbps
                                                    </li>
                                                )}
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
                                                {book.series && (
                                                    <li className="mb-2">
                                                        <strong>Series:</strong> {book.series}
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
                                                        {!book.output_file_exists && (
                                                            <span className="badge bg-warning text-dark ms-2">File missing</span>
                                                        )}
                                                    </li>
                                                )}
                                                {book.file_size != null && (
                                                    <li className="mb-2">
                                                        <strong>File Size:</strong> {formatFileSize(book.file_size)}
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

                            {/* Chapters (DONE books only) */}
                            {book.status.status === StatusChoice.DONE && (
                                <div className="col-12 mt-3">
                                    <div className="card">
                                        <div
                                            className="card-header d-flex align-items-center justify-content-between"
                                            style={{ cursor: 'pointer' }}
                                            onClick={handleLoadChapters}
                                        >
                                            <h5 className="mb-0">
                                                <i className="fa-solid fa-list-ol me-2" />
                                                Chapters
                                            </h5>
                                            <i className={`fas fa-angle-${chaptersOpen ? 'up' : 'down'}`} />
                                        </div>
                                        {chaptersOpen && (
                                            <div className="card-body">
                                                {chapterError && (
                                                    <div className="alert alert-danger py-2">{chapterError}</div>
                                                )}
                                                {importError && (
                                                    <div className="alert alert-danger py-2">{importError}</div>
                                                )}
                                                {chapterSaveMessage && (
                                                    <div className="alert alert-info">{chapterSaveMessage}</div>
                                                )}
                                                {importChapterError && (
                                                    <div className="alert alert-warning">{importChapterError}</div>
                                                )}
                                                {loadingChapters ? (
                                                    <div className="text-center py-3"><div className="spinner-border" /></div>
                                                ) : chapters.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-muted mb-3">No chapters file found for this book.</p>
                                                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={handleAddChapter}
                                                            >
                                                                <i className="fas fa-plus me-1" /> Create Manually
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => chapterFileInputRef.current?.click()}
                                                            >
                                                                <i className="fas fa-file-import me-1" /> Import .txt / .csv
                                                            </button>
                                                        </div>
                                                        <input
                                                            ref={chapterFileInputRef}
                                                            type="file"
                                                            accept=".txt,.csv"
                                                            className="d-none"
                                                            onChange={handleImportChapters}
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="table-responsive">
                                                            <table className="table table-sm">
                                                                <thead>
                                                                    <tr>
                                                                        <th style={{ width: 50 }}>#</th>
                                                                        <th style={{ width: 130 }}>Timestamp</th>
                                                                        <th>Name</th>
                                                                        <th style={{ width: 40 }} />
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {chapters.map((ch, i) => (
                                                                        <tr key={i}>
                                                                            <td className="text-muted align-middle">{ch.index}</td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm font-monospace"
                                                                                    value={ch.timestamp}
                                                                                    onChange={e => setChapters(prev => {
                                                                                        const next = [...prev];
                                                                                        next[i] = { ...next[i], timestamp: e.target.value };
                                                                                        return next;
                                                                                    })}
                                                                                />
                                                                            </td>
                                                                            <td>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    value={ch.name}
                                                                                    onChange={e => setChapters(prev => {
                                                                                        const next = [...prev];
                                                                                        next[i] = { ...next[i], name: e.target.value };
                                                                                        return next;
                                                                                    })}
                                                                                />
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                <button
                                                                                    className="btn btn-link btn-sm p-0"
                                                                                    style={{ color: 'var(--color-danger)' }}
                                                                                    onClick={() => setChapters(prev =>
                                                                                        prev.filter((_, j) => j !== i).map((c, j) => ({ ...c, index: j + 1 }))
                                                                                    )}
                                                                                    aria-label="Remove chapter"
                                                                                >
                                                                                    <i className="fas fa-times" />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="d-flex gap-2 flex-wrap">
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={handleSaveChapters}
                                                                disabled={savingChapters}
                                                            >
                                                                {savingChapters ? <span className="spinner-border spinner-border-sm me-1" role="status" /> : null}
                                                                Save Chapters
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={handleAddChapter}
                                                            >
                                                                <i className="fas fa-plus me-1" /> Add Row
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => chapterFileInputRef.current?.click()}
                                                            >
                                                                <i className="fas fa-file-import me-1" /> Import .txt / .csv
                                                            </button>
                                                            <input
                                                                ref={chapterFileInputRef}
                                                                type="file"
                                                                accept=".txt,.csv"
                                                                className="d-none"
                                                                onChange={handleImportChapters}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                <div className="form-check mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="deleteFilesCheck"
                                        checked={deleteFiles}
                                        onChange={e => setDeleteFiles(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="deleteFilesCheck">
                                        Also delete the output folder and all its files from disk
                                    </label>
                                </div>
                                <p className="text-muted small mb-0">
                                    {deleteFiles
                                        ? <><i className="fas fa-triangle-exclamation me-1 text-warning" />This will permanently delete the output folder from disk and cannot be undone.</>
                                        : 'Only the Bragibooks record will be removed. Audio files on disk will not be affected.'}
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setShowDeleteModal(false); setDeleteFiles(false); }}
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
                                    ) : deleteFiles ? 'Delete Record & Files' : 'Delete Record'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
        )}

        {showReprocessModal && (
            <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Re-process Book</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowReprocessModal(false)}
                                disabled={reprocessing}
                            />
                        </div>
                        <div className="modal-body">
                            <p>Re-processing will overwrite the existing output file for <strong>{book.title}</strong>.</p>
                            <div className="mb-3">
                                <label className="form-label small text-muted">New ASIN (leave blank to retry with same ASIN)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={book.asin}
                                    value={reprocessAsin}
                                    onChange={e => setReprocessAsin(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowReprocessModal(false)}
                                disabled={reprocessing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-warning"
                                onClick={handleReprocess}
                                disabled={reprocessing}
                            >
                                {reprocessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                                        Re-processing...
                                    </>
                                ) : 'Re-process'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showCoverModal && (
            <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Replace Cover Art</h5>
                            <button type="button" className="btn-close" onClick={() => setShowCoverModal(false)} disabled={replacingCover} />
                        </div>
                        <div className="modal-body">
                            {coverError && <div className="alert alert-danger">{coverError}</div>}
                            <div className="mb-4">
                                <h6>Upload a file</h6>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/jpeg,image/png"
                                    onChange={handleCoverFileChange}
                                    disabled={replacingCover}
                                />
                                {coverPreviewUrl && (
                                    <img src={coverPreviewUrl} alt="Preview" className="img-thumbnail mt-2" style={{ maxHeight: 150 }} />
                                )}
                                <button
                                    className="btn btn-primary mt-2 w-100"
                                    onClick={handleReplaceUpload}
                                    disabled={!coverFile || replacingCover}
                                >
                                    {replacingCover ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                    Upload &amp; Apply
                                </button>
                            </div>
                            <hr />
                            <div>
                                <h6>Re-fetch from Audible</h6>
                                <p className="text-muted small">Downloads the original cover from the Audible URL stored for this book.</p>
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={handleRefetchCover}
                                    disabled={replacingCover || !book.cover_image_link}
                                >
                                    {replacingCover ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                                    Re-fetch from Audible
                                </button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCoverModal(false)} disabled={replacingCover}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showMetaModal && book && (
            <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Edit Metadata</h5>
                            <button type="button" className="btn-close" onClick={() => setShowMetaModal(false)} disabled={savingMeta} />
                        </div>
                        <div className="modal-body">
                            <p className="text-muted small mb-3">Changes are written directly to the .m4b file tags.</p>
                            {[
                                { key: 'title', label: 'Title' },
                                { key: 'author', label: 'Author(s)' },
                                { key: 'narrator', label: 'Narrator(s)' },
                                { key: 'series', label: 'Series' },
                                { key: 'year', label: 'Year', type: 'number' },
                                { key: 'genre', label: 'Genre' },
                            ].map(({ key, label, type }) => (
                                <div className="mb-3" key={key}>
                                    <label className="form-label">{label}</label>
                                    <input
                                        type={type ?? 'text'}
                                        className="form-control"
                                        value={metaForm[key as keyof typeof metaForm]}
                                        onChange={e => setMetaForm(prev => ({ ...prev, [key]: e.target.value }))}
                                    />
                                </div>
                            ))}
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={metaForm.description}
                                    onChange={e => setMetaForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowMetaModal(false)} disabled={savingMeta}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveMeta} disabled={savingMeta}>
                                {savingMeta ? <span className="spinner-border spinner-border-sm me-2" role="status" /> : null}
                                Save to File
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
