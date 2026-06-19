import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

    // Auto-expand/collapse sections based on route
    React.useEffect(() => {
        if (location.pathname.startsWith('/settings')) {
            setExpandedSection('settings');
        } else {
            setExpandedSection(null);
        }
    }, [location.pathname]);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        await logout();
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Top Navigation */}
            <div className="mobile-top-nav d-md-none">
                <div className="d-flex align-items-center">
                    <div className="mobile-brand me-3">
                        <i className="fa-solid fa-scroll text-gold me-2"></i>
                    </div>
                    <button
                        className="btn btn-link text-white p-0 me-3"
                        onClick={toggleSidebar}
                        aria-label="Toggle navigation"
                    >
                        <i className="fa-solid fa-bars fa-lg"></i>
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="sidebar-overlay d-md-none"
                    onClick={closeSidebar}
                />
            )}

            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Branding */}
                <div className="sidebar-brand">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div>
                            <i className="fa-solid fa-scroll me-2"></i>
                            Bragi
                        </div>
                        <button
                            className="btn btn-link text-white d-md-none p-0"
                            onClick={closeSidebar}
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="sidebar-nav">
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link
                                to="/import"
                                className={`nav-link ${isActive('/import') ? 'active' : ''}`}
                                onClick={closeSidebar}
                            >
                                <i className="fa-solid fa-folder-plus"></i>
                                Import
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                to="/"
                                className={`nav-link ${isActive('/') || location.pathname.startsWith('/books') ? 'active' : ''}`}
                                onClick={closeSidebar}
                            >
                                <i className="fa-solid fa-headphones"></i>
                                Library
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link
                                to="/processing"
                                className={`nav-link ${isActive('/processing') ? 'active' : ''}`}
                                onClick={closeSidebar}
                            >
                                <i className="fa-solid fa-list-check"></i>
                                Processing
                            </Link>
                        </li>

                        {/* Settings - Expandable */}
                        <li className="nav-item">
                            <div
                                className="nav-link d-flex justify-content-between align-items-center"
                                onClick={() => toggleSection('settings')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div>
                                    <i className="fa-solid fa-gear"></i>
                                    Settings
                                </div>
                                <i className={`fa-solid fa-chevron-right transition-transform ${expandedSection === 'settings' ? 'rotate-90' : ''}`} style={{ fontSize: '0.8em' }}></i>
                            </div>

                            {/* Nested Settings Items */}
                            {expandedSection === 'settings' && (
                                <ul className="nav flex-column ms-3">
                                    <li className="nav-item">
                                        <Link
                                            to="/settings/configuration"
                                            className={`nav-link ${isActive('/settings/configuration') ? 'active' : ''}`}
                                            onClick={closeSidebar}
                                        >
                                            <i className="fa-solid fa-sliders"></i>
                                            Configuration
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            to="/settings/security"
                                            className={`nav-link ${isActive('/settings/security') ? 'active' : ''}`}
                                            onClick={closeSidebar}
                                        >
                                            <i className="fa-solid fa-shield-halved"></i>
                                            Security
                                        </Link>
                                    </li>
                                    {user?.is_superuser && (
                                        <li className="nav-item">
                                            <Link
                                                to="/settings/users"
                                                className={`nav-link ${isActive('/settings/users') ? 'active' : ''}`}
                                                onClick={closeSidebar}
                                            >
                                                <i className="fa-solid fa-users"></i>
                                                Users
                                            </Link>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <Link
                                            to="/settings/about"
                                            className={`nav-link ${isActive('/settings/about') ? 'active' : ''}`}
                                            onClick={closeSidebar}
                                        >
                                            <i className="fa-solid fa-info-circle"></i>
                                            About
                                        </Link>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>

                {/* Footer with Logout */}
                <div className="sidebar-footer">
                    <button
                        className="theme-toggle"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <i className="fa-solid fa-sign-out-alt"></i>
                        Logout
                    </button>
                    {user && (
                        <div className="small mt-2 px-3">
                            Signed in as <strong>{user.username}</strong>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Sidebar;
