import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const renderPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>;
            }
            return (
                <button
                    key={page}
                    className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange(page as number)}
                    disabled={page === currentPage}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="pagination">
            <button
                className="pagination-button"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                title="First page"
            >
                <i className="fa-solid fa-angles-left"></i>
            </button>
            <button
                className="pagination-button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous page"
            >
                <i className="fa-solid fa-angle-left"></i>
            </button>

            {renderPageNumbers()}

            <button
                className="pagination-button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Next page"
            >
                <i className="fa-solid fa-angle-right"></i>
            </button>
            <button
                className="pagination-button"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                title="Last page"
            >
                <i className="fa-solid fa-angles-right"></i>
            </button>
        </div>
    );
};

export default Pagination;
