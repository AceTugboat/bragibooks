import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileExplorer from '../components/FileExplorer';
import { directoryApi, asinSearchApi, bookApi, getErrorMessage } from '../api/services';
import { useData } from '../context/DataContext';
import type { FileItem, AsinSearchResult } from '../types';

interface AsinCard {
    srcPath: string;
    searching: boolean;
    options: AsinSearchResult[];
    selectedAsin: string;
    manualAsin: string;
    imageUrl: string;
}

const FALLBACK_IMAGE = '/static/images/cover_not_available.jpg';

const ImportPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshBooks } = useData();

    const [step, setStep] = useState<1 | 2>(1);
    const [contents, setContents] = useState<FileItem[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [cards, setCards] = useState<AsinCard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSelected, setShowSelected] = useState(false);

    useEffect(() => {
        directoryApi.getContents()
            .then(data => setContents(data.contents))
            .catch(err => setError(getErrorMessage(err)))
            .finally(() => setLoadingFiles(false));
    }, []);

    const fetchChildren = useCallback(async (path: string): Promise<FileItem[]> => {
        const data = await directoryApi.getContents(path);
        return data.contents;
    }, []);

    const handleNext = useCallback(async () => {
        setShowSelected(false);
        setError(null);
        const initial: AsinCard[] = selectedPaths.map(p => ({
            srcPath: p,
            searching: true,
            options: [],
            selectedAsin: '',
            manualAsin: '',
            imageUrl: FALLBACK_IMAGE,
        }));
        setCards(initial);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        selectedPaths.forEach(async (path, i) => {
            const dirName = path.split('/').pop() || path;
            try {
                const results = await asinSearchApi.search({ media_dir: dirName });
                setCards(prev => {
                    const updated = [...prev];
                    updated[i] = {
                        ...updated[i],
                        searching: false,
                        options: results,
                        selectedAsin: results.length > 0 ? results[0].asin : '',
                        imageUrl: results.length > 0 ? (results[0].image_link?.[0] ?? FALLBACK_IMAGE) : FALLBACK_IMAGE,
                    };
                    return updated;
                });
            } catch {
                setCards(prev => {
                    const updated = [...prev];
                    updated[i] = { ...updated[i], searching: false };
                    return updated;
                });
            }
        });
    }, [selectedPaths]);

    const handleBack = () => { setStep(1); setError(null); };

    const handleAsinSelect = (index: number, asin: string) => {
        setCards(prev => {
            const updated = [...prev];
            const selected = updated[index].options.find(o => o.asin === asin);
            updated[index] = {
                ...updated[index],
                selectedAsin: asin,
                imageUrl: selected?.image_link?.[0] ?? FALLBACK_IMAGE,
            };
            return updated;
        });
    };

    const handleManualAsinChange = (index: number, value: string) => {
        setCards(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], manualAsin: value };
            return updated;
        });
    };

    const handleRemove = (index: number) => {
        setCards(prev => prev.filter((_, i) => i !== index));
    };

    const resolvedAsin = (card: AsinCard) =>
        card.manualAsin.length === 10 ? card.manualAsin : card.selectedAsin;

    const canSubmit = cards.length > 0 && cards.every(c => resolvedAsin(c).length === 10);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await directoryApi.startImport(cards.map(c => c.srcPath));
            const matches: Record<string, string> = {};
            cards.forEach(c => { matches[c.srcPath] = resolvedAsin(c); });
            await bookApi.matchAsin(matches);
            await refreshBooks();
            navigate('/processing');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Step 1: Full-viewport file browser ──────────────────────────
    if (step === 1) {
        return (
            <div className="import-file-view">
                {error && (
                    <div className="alert alert-danger mx-0 mb-0 rounded-0" role="alert">{error}</div>
                )}

                <div className="import-file-tree">
                    {loadingFiles ? (
                        <div className="text-center p-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading…</span>
                            </div>
                        </div>
                    ) : (
                        <FileExplorer
                            rootItems={contents}
                            selectedPaths={selectedPaths}
                            onSelectionChange={setSelectedPaths}
                            fetchChildren={fetchChildren}
                        />
                    )}
                </div>

                {/* Slide-up selected folders drawer */}
                {showSelected && selectedPaths.length > 0 && (
                    <div className="import-selected-drawer">
                        <div className="import-selected-drawer-header">
                            <span className="fw-semibold">
                                {selectedPaths.length} folder{selectedPaths.length !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                className="btn-close btn-close-white"
                                aria-label="Close"
                                onClick={() => setShowSelected(false)}
                            />
                        </div>
                        <div className="import-selected-drawer-list">
                            {selectedPaths.map(path => (
                                <div key={path} className="import-selected-drawer-item">
                                    <i className="fas fa-folder me-2" style={{ color: 'var(--color-info)' }} />
                                    <div className="flex-grow-1 overflow-hidden">
                                        <div className="fw-medium text-truncate">{path.split('/').pop() || path}</div>
                                        <div className="small text-truncate" style={{ color: 'var(--color-text-tertiary)' }}>{path}</div>
                                    </div>
                                    <button
                                        className="btn btn-link btn-sm p-0 ms-2 flex-shrink-0"
                                        style={{ color: 'var(--color-danger)' }}
                                        onClick={() => setSelectedPaths(prev => prev.filter(p => p !== path))}
                                        aria-label="Remove"
                                    >
                                        <i className="fas fa-times" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fixed action bar */}
                <div className="import-action-bar">
                    {selectedPaths.length > 0 ? (
                        <button
                            className="import-action-bar-label btn btn-link p-0 text-decoration-none"
                            onClick={() => setShowSelected(prev => !prev)}
                        >
                            <i className={`fas fa-chevron-${showSelected ? 'down' : 'up'} me-2`} />
                            {selectedPaths.length} folder{selectedPaths.length !== 1 ? 's' : ''} selected
                        </button>
                    ) : (
                        <span className="import-action-bar-label">Select folders to import</span>
                    )}
                    <button
                        className="btn btn-success btn-sm px-4"
                        onClick={handleNext}
                        disabled={loadingFiles || selectedPaths.length === 0}
                    >
                        Next <i className="fas fa-arrow-right ms-1" />
                    </button>
                </div>
            </div>
        );
    }

    // ── Step 2: ASIN match cards ─────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} style={{ paddingBottom: '72px' }}>
            <div className="d-flex align-items-center gap-2 mb-4">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleBack}
                >
                    <i className="fas fa-arrow-left me-1" /> Back
                </button>
                <h5 className="mb-0">Match Audiobooks</h5>
                <span className="text-muted small ms-1">— confirm each match before submitting</span>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
            )}

            <div className="d-flex flex-column gap-3">
                {cards.map((card, index) => (
                    <div
                        key={card.srcPath}
                        className="card"
                        style={{ border: '1px solid var(--color-border-primary)' }}
                    >
                        <div className="card-body">
                            <div className="d-flex gap-3 align-items-start">
                                {/* Cover */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={card.imageUrl}
                                        alt=""
                                        style={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'block',
                                        }}
                                        onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-grow-1 min-width-0">
                                    <div
                                        className="fw-semibold small text-truncate mb-2"
                                        title={card.srcPath}
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        <i className="fas fa-folder me-1 opacity-50" />
                                        {card.srcPath.split('/').pop() || card.srcPath}
                                    </div>

                                    {card.searching ? (
                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <div className="spinner-border spinner-border-sm" role="status" />
                                            Searching Audible…
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-2">
                                            <select
                                                className="form-select form-select-sm"
                                                value={card.selectedAsin}
                                                onChange={e => handleAsinSelect(index, e.target.value)}
                                            >
                                                {card.options.length === 0 && (
                                                    <option value="" disabled>No results found</option>
                                                )}
                                                {card.options.map(opt => (
                                                    <option key={opt.asin} value={opt.asin}>
                                                        {opt.title} — {opt.author}
                                                        {opt.narrator ? ` / ${opt.narrator}` : ''}
                                                    </option>
                                                ))}
                                                <option value="">Enter ASIN manually…</option>
                                            </select>

                                            {(card.selectedAsin === '' || card.options.length === 0) && (
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="text"
                                                    placeholder="ASIN — 10 characters (e.g. B001234567)"
                                                    maxLength={10}
                                                    value={card.manualAsin}
                                                    onChange={e => handleManualAsinChange(index, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Remove */}
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 flex-shrink-0"
                                    style={{ color: 'var(--color-danger)', lineHeight: 1 }}
                                    onClick={() => handleRemove(index)}
                                    title="Remove"
                                >
                                    <i className="fas fa-times" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {cards.length === 0 && (
                    <div className="text-muted text-center py-5">
                        All items removed.{' '}
                        <button type="button" className="btn btn-link p-0" onClick={handleBack}>
                            Go back
                        </button>{' '}
                        to select folders.
                    </div>
                )}
            </div>

            {/* Sticky submit bar */}
            <div className="import-action-bar">
                <span className="import-action-bar-label">
                    {cards.length} book{cards.length !== 1 ? 's' : ''} to process
                </span>
                <button
                    type="submit"
                    className="btn btn-success btn-sm px-4"
                    disabled={!canSubmit || submitting}
                >
                    {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" />Submitting…</>
                    ) : (
                        <>Submit {cards.length > 0 ? cards.length : ''} <i className="fas fa-arrow-right ms-1" /></>
                    )}
                </button>
            </div>
        </form>
    );
};

export default ImportPage;
