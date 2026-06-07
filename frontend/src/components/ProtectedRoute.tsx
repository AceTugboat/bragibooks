import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, isLoading, setupNeeded } = useAuth();

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // If setup is needed, redirect to setup page
    if (setupNeeded) {
        return <Navigate to="/setup" replace />;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render child routes
    return <Outlet />;
};

export default ProtectedRoute;
