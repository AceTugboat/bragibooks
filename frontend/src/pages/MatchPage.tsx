import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { asinSearchApi, bookApi, getErrorMessage } from '../api/services';
import type { AsinSearchResult } from '../types';

interface MatchItem {
    srcPath: string;
    selectedAsin: string;
    options: AsinSearchResult[];
    imageUrl: string;
}

const MatchPage: React.FC = () => {
    const navigate = useNavigate();
    const [matchItems, setMatchItems] = useState<MatchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
    const [searchTitle, setSearchTitle] = useState('');
    const [searchAuthor, setSearchAuthor] = useState('');
    const [searchKeywords, setSearchKeywords] = useState('');
    const [searchNotification, setSearchNotification] = useState(false);

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
            setLoading(true);
            // Get input directories from session (from ImportPage)
            const inputDirs = await bookApi.getInputDirectories();

            if (inputDirs.length === 0) {
                // No items to match, redirect to import
                navigate('/');
                return;
            }

            // Fetch ASIN options for each directory
            const items = await Promise.all(
                inputDirs.map(async (path) => {
                    const fileName = path.split('/').pop() || path;
                    try {
                        const results = await asinSearchApi.search({ media_dir: fileName });
                        return {
                            srcPath: path,
                            selectedAsin: results.length > 0 ? results[0].asin : '',
                            options: results,
                            imageUrl: results.length > 0 && results[0].image_link?.length > 0 ? results[0].image_link[0] : '/static/images/cover_not_available.jpg',
                        };
                    } catch {
                        return {
                            srcPath: path,
                            selectedAsin: '',
                            options: [],
                            imageUrl: '/static/images/cover_not_available.jpg',
                        };
                    }
                })
            );

            setMatchItems(items);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleAsinChange = (index: number, asin: string) => {
        setMatchItems(prev => {
            const updated = [...prev];
            updated[index].selectedAsin = asin;
            const selected = updated[index].options.find(opt => opt.asin === asin);
            if (selected) {
                updated[index].imageUrl = selected.image_link?.[0] || '/static/images/cover_not_available.jpg';
            }
            return updated;
        });
    };

    const openSearchModal = (index: number) => {
        setCurrentItemIndex(index);
        setShowSearchModal(true);
        setSearchNotification(false);
    };

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchTitle('');
        setSearchAuthor('');
        setSearchKeywords('');
        setSearchNotification(false);
    };

    const handleCustomSearch = async () => {
        if (currentItemIndex === null) return;

        try {
            const results = await asinSearchApi.search({
                title: searchTitle,
                author: searchAuthor,
                keywords: searchKeywords,
            });

            if (results.length === 0) {
                setSearchNotification(true);
                return;
            }

            setMatchItems(prev => {
                const updated = [...prev];
                updated[currentItemIndex].options = results;
                updated[currentItemIndex].selectedAsin = results[0].asin;
                updated[currentItemIndex].imageUrl = results[0].image_link?.[0] || '/static/images/cover_not_available.jpg';
                return updated;
            });

            closeSearchModal();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const openRemoveModal = (index: number) => {
        setCurrentItemIndex(index);
        setShowRemoveModal(true);
    };

    const closeRemoveModal = () => {
        setShowRemoveModal(false);
    };

    const handleRemoveItem = () => {
        if (currentItemIndex !== null) {
            setMatchItems(prev => prev.filter((_, i) => i !== currentItemIndex));
        }
        closeRemoveModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Build matches object
        const matches: Record<string, string> = {};
        matchItems.forEach(item => {
            if (item.selectedAsin && item.selectedAsin.length === 10) {
                matches[item.srcPath] = item.selectedAsin;
            }
        });

        try {
            await bookApi.matchAsin(matches);
            navigate('/books');
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const canSubmit = matchItems.every(item => item.selectedAsin.length === 10);

    if (loading) {
        return (
            <div className="container my-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col">
                    <form onSubmit={handleSubmit}>
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">Submit ASINs</h5>
                            </div>
                            <div className="card-body">
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <div className="container">
                                    {matchItems.map((item, index) => (
                                        <div key={index} className="row mb-4">
                                            <div className="col-md-3">
                                                <div className="mb-2" style={{ minHeight: '150px' }}>
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.srcPath.split('/').pop()}
                                                        className="img-fluid"
                                                        style={{ width: '150px', borderRadius: '10px', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/static/images/cover_not_available.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <label className="form-label fw-bold text-break">{item.srcPath.split('/').pop()}</label>
                                            </div>
                                            <div className="col-md-9 d-flex flex-column justify-content-center">
                                                <div className="d-flex align-items-center">
                                                    <i
                                                        className="fa fa-times me-3 text-danger"
                                                        style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                                        onClick={() => openRemoveModal(index)}
                                                        title="Remove item"
                                                    ></i>
                                                    <div className="flex-grow-1 me-3" style={{ minWidth: 0 }}>
                                                        <select
                                                            className="form-select text-truncate"
                                                            value={item.selectedAsin}
                                                            onChange={(e) => handleAsinChange(index, e.target.value)}
                                                            style={item.options.length === 0 ? { borderColor: 'red', borderWidth: '2px' } : {}}
                                                        >
                                                            {item.options.length > 0 ? (
                                                                item.options.map(opt => (
                                                                    <option key={opt.asin} value={opt.asin}>
                                                                        {opt.title} by {opt.authors} - Narrator {opt.narrators}: {opt.asin}
                                                                    </option>
                                                                ))
                                                            ) : (
                                                                <option value="">No Audiobook results found, try a custom search...</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => openSearchModal(index)}
                                                        className="text-nowrap"
                                                        style={{ minWidth: '140px' }}
                                                    >
                                                        Custom Search
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-primary w-100" type="submit" disabled={!canSubmit}>
                                    Submit ASINs
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Search Modal */}
            <Modal show={showSearchModal} onHide={closeSearchModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Custom Search: {currentItemIndex !== null ? matchItems[currentItemIndex]?.srcPath : ''}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label className="form-label">Title</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Title"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Author</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Author"
                            value={searchAuthor}
                            onChange={(e) => setSearchAuthor(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Keywords</label>
                        <input
                            className="form-control"
                            type="text"
                            placeholder="Keywords"
                            value={searchKeywords}
                            onChange={(e) => setSearchKeywords(e.target.value)}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    {searchNotification && (
                        <div className="alert alert-warning w-100">No results found for this search...</div>
                    )}
                    <div>
                        <Button variant="primary" onClick={handleCustomSearch}>
                            Search
                        </Button>
                        <Button variant="secondary" onClick={closeSearchModal} className="ms-2">
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Remove Confirmation Modal */}
            <Modal show={showRemoveModal} onHide={closeRemoveModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure you want to remove this item?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-center gap-2">
                        <Button variant="danger" onClick={handleRemoveItem}>
                            Yes
                        </Button>
                        <Button variant="secondary" onClick={closeRemoveModal}>
                            No
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MatchPage;
