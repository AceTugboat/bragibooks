import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LibraryBookCard from '../components/LibraryBookCard';
import Pagination from '../components/Pagination';
import { useData } from '../context/DataContext';

type SortOption = 'title' | 'release_date' | 'author' | 'recently_added';

const BooksPage: React.FC = () => {
    const location = useLocation();
    const { books, loadingBooks, errorBooks } = useData();

    // Filter/Sort/Pagination state - restore from location.state if available
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

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Filter and sort books
    const filteredAndSortedBooks = useMemo(() => {
        let result = [...(books.done ?? [])];

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(book => {
                const authors = book.authors.map(a => `${a.first_name} ${a.last_name}`.toLowerCase()).join(' ');
                return (
                    book.title.toLowerCase().includes(query) ||
                    authors.includes(query)
                );
            });
        }

        // Sort books
        result.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'release_date':
                    return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
                case 'author':
                    const authorA = a.authors[0] ? `${a.authors[0].last_name} ${a.authors[0].first_name}` : '';
                    const authorB = b.authors[0] ? `${b.authors[0].last_name} ${b.authors[0].first_name}` : '';
                    return authorA.localeCompare(authorB);
                case 'recently_added':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return 0;
            }
        });

        return result;
    }, [books.done, searchQuery, sortBy]);

    // Paginate books
    const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage);
    const paginatedBooks = filteredAndSortedBooks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortBy, itemsPerPage]);

    if (loadingBooks) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (errorBooks) {
        return (
            <div className="alert alert-danger m-4" role="alert">
                {errorBooks}
            </div>
        );
    }

    if (books.done.length === 0) {
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

    return (
        <div className="library-page">
            <PageHeader title={`My Library (${filteredAndSortedBooks.length})`}>
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

                    {/* Sort Icon (Unified for Mobile & Desktop) */}
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
            {paginatedBooks.length > 0 ? (
                <>
                    <div className="library-grid">
                        {paginatedBooks.map(book => (
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
