import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LibraryBookCard from '../components/LibraryBookCard';
import Pagination from '../components/Pagination';
import { bookApi } from '../api/services';
import type { LibraryPage } from '../api/services';

type SortOption = 'title' | 'release_date' | 'author' | 'recently_added';

const DEFAULT_ORDER: Record<SortOption, 'asc' | 'desc'> = {
    title: 'asc',
    release_date: 'desc',
    author: 'asc',
    recently_added: 'desc',
};

const BooksPage: React.FC = () => {
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState(
        (location.state as any)?.searchQuery || ''
    );
    const [sortBy, setSortBy] = useState<SortOption>(
        (location.state as any)?.sortBy || 'title'
    );
    const [itemsPerPage, setItemsPerPage] = useState(
        (location.state as any)?.itemsPerPage || 25
    );
    const [currentPage, setCurrentPage] = useState(
        (location.state as any)?.currentPage || 1
    );
    const [searchFocused, setSearchFocused] = useState(false);
    const [libraryData, setLibraryData] = useState<LibraryPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const prevSearchRef = useRef(searchQuery);

    const fetchLibrary = useCallback(async (params: {
        page: number; page_size: number; sort: SortOption;
        order: 'asc' | 'desc'; q: string;
    }) => {
        try {
            setLoading(true);
            const data = await bookApi.getLibrary(params);
            setLibraryData(data);
            setError(null);
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || 'Failed to load library');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const searchChanged = prevSearchRef.current !== searchQuery;
        prevSearchRef.current = searchQuery;

        if (searchChanged) {
            const timer = setTimeout(() => {
                setCurrentPage(1);
                fetchLibrary({
                    page: 1,
                    page_size: itemsPerPage,
                    sort: sortBy,
                    order: DEFAULT_ORDER[sortBy],
                    q: searchQuery,
                });
            }, 300);
            return () => clearTimeout(timer);
        } else {
            fetchLibrary({
                page: currentPage,
                page_size: itemsPerPage,
                sort: sortBy,
                order: DEFAULT_ORDER[sortBy],
                q: searchQuery,
            });
        }
    }, [searchQuery, sortBy, itemsPerPage, currentPage]);

    // Reset to page 1 when sort or page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, itemsPerPage]);

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    if (loading && !libraryData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-4" role="alert">
                {error}
            </div>
        );
    }

    if (libraryData && libraryData.count === 0 && !searchQuery) {
        return (
            <div className="library-page">
                <PageHeader title="My Library" />
                <div className="d-flex flex-column align-items-center justify-content-center text-center py-5 my-5">
                    <i className="fa-solid fa-headphones fa-4x mb-4 text-muted"></i>
                    <h3 className="mb-2">Your library is empty</h3>
                    <p className="text-muted mb-4">Import your first audiobook to get started.</p>
                    <Link to="/import" className="btn btn-primary btn-lg">
                        Import your first book →
                    </Link>
                </div>
            </div>
        );
    }

    const totalPages = libraryData?.total_pages ?? 1;
    const books = libraryData?.results ?? [];
    const totalCount = libraryData?.count ?? 0;

    return (
        <div className="library-page">
            <PageHeader title={`My Library (${totalCount})`}>
                <div className="library-controls">
                    {/* Search Bar - expandable on focus */}
                    <div className={`library-search ${searchFocused ? 'focused' : ''}`}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                        />
                        {searchQuery && (
                            <button
                                className="btn btn-sm btn-link"
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        )}
                    </div>

                    {/* Sort Icon */}
                    <div className="sort-wrapper ms-2" title="Sort books">
                        <i className="fa-solid fa-arrow-down-short-wide text-gold"></i>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            aria-label="Sort books"
                        >
                            <option value="title">Alphabetical</option>
                            <option value="release_date">Release Date</option>
                            <option value="author">Author</option>
                            <option value="recently_added">Recently Added</option>
                        </select>
                    </div>
                </div>
            </PageHeader>

            {/* Library Grid */}
            {books.length > 0 ? (
                <>
                    <div className="library-grid">
                        {books.map(book => (
                            <LibraryBookCard
                                key={book.id}
                                book={book}
                                libraryState={{ searchQuery, sortBy, itemsPerPage, currentPage }}
                            />
                        ))}
                    </div>

                    {/* Pagination and Items Per Page */}
                    <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3 mt-5 mb-4">
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}

                        <div className="d-flex align-items-center">
                            <span className="me-2 text-muted small">Show:</span>
                            <select
                                className="form-select form-select-sm"
                                style={{ width: 'auto' }}
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </>
            ) : (
                <div className="library-empty">
                    <div className="text-center my-5">
                        <i className="fa-solid fa-book fa-3x mb-3 text-muted"></i>
                        <h4>No books found</h4>
                        {searchQuery && (
                            <p className="text-muted">
                                Try adjusting your search or{' '}
                                <button className="btn btn-link p-0" onClick={() => setSearchQuery('')}>
                                    clear filters
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksPage;
