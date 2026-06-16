import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileExplorer from '../components/FileExplorer';
import { directoryApi, asinSearchApi, bookApi, getErrorMessage } from '../api/services';
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

    // Step 1 state
    const [step, setStep] = useState<1 | 2>(1);
    const [contents, setContents] = useState<FileItem[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);

    // Step 2 state
    const [cards, setCards] = useState<AsinCard[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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

        // Auto-search each path in parallel
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
                        imageUrl: results.length > 0
                            ? (results[0].image_link?.[0] ?? FALLBACK_IMAGE)
                            : FALLBACK_IMAGE,
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

    const handleBack = () => {
        setStep(1);
        setError(null);
    };

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
            navigate('/processing');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    if (step === 1) {
        return (
            <div className="row">
                <div className="col">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Step 1 — Choose Files or Directories to Import</h5>
                        </div>
                        <div className="card-body p-0">
                            {error && (
                                <div className="alert alert-danger m-3 mb-0" role="alert">{error}</div>
                            )}
                            <div className="d-flex" style={{ minHeight: 400 }}>
                                {/* File Explorer */}
                                <div className="flex-grow-1 border-end" style={{ minWidth: 0 }}>
                                    {loadingFiles ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
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
                                {/* Selection Panel */}
                                <div className="import-selection-panel p-3" style={{ width: 260, flexShrink: 0 }}>
                                    <div className="fw-semibold mb-2 small text-uppercase text-muted">
                                        Selected ({selectedPaths.length})
                                    </div>
                                    {selectedPaths.length === 0 ? (
                                        <p className="text-muted small">Nothing selected yet. Check items on the left to add them.</p>
                                    ) : (
                                        <ul className="list-unstyled mb-0">
                                            {selectedPaths.map(p => (
                                                <li key={p} className="d-flex align-items-start justify-content-between gap-1 mb-2">
                                                    <span className="small text-break">{p.split('/').pop() || p}</span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link btn-sm p-0 flex-shrink-0 text-danger"
                                                        onClick={() => setSelectedPaths(prev => prev.filter(x => x !== p))}
                                                        title="Remove"
                                                    >
                                                        <i className="fas fa-times" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-footer p-3">
                            <button
                                className="btn btn-success w-100"
                                onClick={handleNext}
                                disabled={loadingFiles || selectedPaths.length === 0}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col">
                <form onSubmit={handleSubmit}>
                    <div className="card">
                        <div className="card-header d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleBack}
                            >
                                &larr; Back
                            </button>
                            <h5 className="mb-0">Step 2 — Match Audiobook</h5>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">{error}</div>
                            )}
                            {cards.map((card, index) => (
                                <div key={card.srcPath} className="row mb-4 pb-4 border-bottom">
                                    <div className="col-auto text-center">
                                        <img
                                            src={card.imageUrl}
                                            alt={card.srcPath.split('/').pop()}
                                            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                                            onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                        />
                                    </div>
                                    <div className="col d-flex flex-column justify-content-center gap-2">
                                        <div className="fw-bold text-break small">
                                            {card.srcPath.split('/').pop()}
                                        </div>
                                        {card.searching ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="spinner-border spinner-border-sm" role="status" />
                                                <span className="text-muted small">Searching Audible…</span>
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="form-label fw-semibold mb-1">Match</label>
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
                                                            {opt.title} — {opt.author}{opt.narrator ? ` / ${opt.narrator}` : ''} ({opt.asin})
                                                        </option>
                                                    ))}
                                                    <option value="">Enter manually…</option>
                                                </select>
                                            </div>
                                        )}
                                        {(card.selectedAsin === '' || card.options.length === 0) && (
                                            <div>
                                                <label className="form-label small mb-1">
                                                    ASIN <span className="text-muted">(10 characters)</span>
                                                </label>
                                                <input
                                                    className="form-control form-control-sm"
                                                    type="text"
                                                    placeholder="e.g. B001234567"
                                                    maxLength={10}
                                                    value={card.manualAsin}
                                                    onChange={e => handleManualAsinChange(index, e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger align-self-start"
                                            onClick={() => handleRemove(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cards.length === 0 && (
                                <div className="text-muted text-center py-4">
                                    All items removed. <button type="button" className="btn btn-link p-0" onClick={handleBack}>Go back</button> to select files.
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <button
                                className="btn btn-success w-100"
                                type="submit"
                                disabled={!canSubmit || submitting}
                            >
                                {submitting ? 'Submitting…' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportPage;
