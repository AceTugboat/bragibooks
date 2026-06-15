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

    const handleNext = useCallback(async () => {
        if (selectedPaths.length === 0) {
            setError('Select at least one directory to import');
            return;
        }
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
                            <h5 className="mb-0">Step 1 — Choose Files or Directories to process</h5>
                        </div>
                        <div className="card-body p-0">
                            {error && (
                                <div className="alert alert-danger m-3" role="alert">{error}</div>
                            )}
                            {loadingFiles ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <FileExplorer
                                    contents={contents}
                                    selectedPaths={selectedPaths}
                                    onSelectionChange={setSelectedPaths}
                                />
                            )}
                            <div className="p-3">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={handleNext}
                                    disabled={loadingFiles}
                                >
                                    Next
                                </button>
                            </div>
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
                            <h5 className="mb-0">Step 2 — Match ASINs</h5>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">{error}</div>
                            )}
                            {cards.map((card, index) => (
                                <div key={card.srcPath} className="row mb-4 pb-4 border-bottom">
                                    <div className="col-md-3 text-center">
                                        <img
                                            src={card.imageUrl}
                                            alt={card.srcPath.split('/').pop()}
                                            className="img-fluid mb-2"
                                            style={{ width: 150, borderRadius: 10, objectFit: 'cover' }}
                                            onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                        />
                                        <div className="fw-bold text-break small">
                                            {card.srcPath.split('/').pop()}
                                        </div>
                                    </div>
                                    <div className="col-md-9 d-flex flex-column justify-content-center gap-2">
                                        {card.searching ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="spinner-border spinner-border-sm" role="status" />
                                                <span className="text-muted">Searching Audible…</span>
                                            </div>
                                        ) : card.options.length > 0 ? (
                                            <div>
                                                <label className="form-label fw-semibold">Select a match</label>
                                                {card.options.map(opt => (
                                                    <div key={opt.asin} className="mb-2 d-flex align-items-center gap-2">
                                                        <input
                                                            className="form-check-input flex-shrink-0"
                                                            type="radio"
                                                            name={`asin-${index}`}
                                                            id={`asin-${index}-${opt.asin}`}
                                                            value={opt.asin}
                                                            checked={card.selectedAsin === opt.asin}
                                                            onChange={() => handleAsinSelect(index, opt.asin)}
                                                        />
                                                        <img
                                                            src={opt.image_link?.[0] ?? FALLBACK_IMAGE}
                                                            alt=""
                                                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                                                            onError={e => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                                        />
                                                        <label
                                                            className="form-check-label text-truncate"
                                                            htmlFor={`asin-${index}-${opt.asin}`}
                                                            title={`${opt.title} — ${opt.authors}`}
                                                        >
                                                            <div className="fw-semibold">{opt.title}</div>
                                                            <div className="text-muted small">{opt.authors} <span className="ms-1">({opt.asin})</span></div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-muted small">No Audible results found.</div>
                                        )}
                                        <div>
                                            <label className="form-label fw-semibold mb-1">
                                                Manual ASIN
                                                <span className="text-muted fw-normal ms-1">(overrides selection)</span>
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
                                className="btn btn-primary w-100"
                                type="submit"
                                disabled={!canSubmit || submitting}
                            >
                                {submitting ? 'Submitting…' : 'Submit ASINs'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportPage;
