import React from 'react';
import { Link } from 'react-router-dom';

export interface Toast {
    id: number;
    type: 'done' | 'error';
    bookId: number;
    title: string;
}

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            className="toast-container position-fixed bottom-0 end-0 p-3"
            style={{ zIndex: 1100 }}
        >
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast show align-items-center text-bg-${toast.type === 'done' ? 'success' : 'danger'} border-0 mb-2`}
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="d-flex">
                        <div className="toast-body">
                            {toast.type === 'done' ? (
                                <>
                                    <i className="fa-solid fa-check me-2"></i>
                                    <Link
                                        to={`/books/${toast.bookId}`}
                                        className="text-white fw-semibold"
                                        style={{ textDecoration: 'underline' }}
                                    >
                                        {toast.title}
                                    </Link>
                                    {' '}is ready
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-xmark me-2"></i>
                                    <Link
                                        to="/processing"
                                        className="text-white fw-semibold"
                                        style={{ textDecoration: 'underline' }}
                                    >
                                        {toast.title}
                                    </Link>
                                    {' '}failed — view details
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white me-2 m-auto"
                            aria-label="Close"
                            onClick={() => onDismiss(toast.id)}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
