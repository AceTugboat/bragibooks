import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import type { Settings } from '../types';
import { settingsApi, getErrorMessage } from '../api/services';
import { useTheme } from '../context/ThemeContext';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [settings, setSettings] = useState<Settings>({
        api_url: 'https://api.audnex.us',
        completed_directory: '/input/done',
        input_directory: '/input',
        num_cpus: 0,
        output_directory: '/output',
        output_scheme: 'author/title/title - subtitle',
    });
    const [originalSettings, setOriginalSettings] = useState<Settings>(settings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

    // Check if settings have been modified
    const isDirty = useMemo(() => {
        return JSON.stringify(settings) !== JSON.stringify(originalSettings);
    }, [settings, originalSettings]);

    // Block navigation if there are unsaved changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        loadData();
    }, []);

    // Handle navigation blocker
    useEffect(() => {
        if (blocker.state === 'blocked') {
            setShowUnsavedModal(true);
            setPendingNavigation(blocker.location.pathname);
        }
    }, [blocker]);

    const loadData = async () => {
        try {
            setLoading(true);
            const settingsData = await settingsApi.get();
            if (settingsData) {
                setSettings(settingsData);
                setOriginalSettings(settingsData);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setError(null);
            await settingsApi.update(settings);
            setOriginalSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleChange = (field: keyof Settings, value: string | number) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setSuccess(false);
    };

    const handleSaveAndLeave = async () => {
        try {
            await settingsApi.update(settings);
            // Update original settings immediately
            setOriginalSettings(settings);
            setShowUnsavedModal(false);

            // Proceed with navigation
            if (blocker.state === 'blocked') {
                blocker.proceed();
            } else if (pendingNavigation) {
                // If blocker is not active, navigate directly
                navigate(pendingNavigation);
            }
        } catch (err) {
            setError(getErrorMessage(err));
            setShowUnsavedModal(false);
        }
    };

    const handleDiscardAndLeave = () => {
        setSettings(originalSettings);
        setShowUnsavedModal(false);
        if (pendingNavigation) {
            navigate(pendingNavigation);
        } else if (blocker.state === 'blocked') {
            blocker.proceed();
        }
    };

    const handleCancelNavigation = () => {
        setShowUnsavedModal(false);
        setPendingNavigation(null);
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title="Settings"
            >
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!isDirty}
                >
                    <i className="fas fa-save me-2"></i>
                    Save
                </button>
            </PageHeader>

            <div className="container-fluid px-4 py-3">
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError(null)}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        Settings saved successfully!
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccess(false)}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* Configuration Card */}
                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Configuration</h5>

                        <div className="mb-3">
                            <label className="form-label">API URL</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.api_url}
                                onChange={(e) => handleChange('api_url', e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Input Directory</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.input_directory}
                                onChange={(e) => handleChange('input_directory', e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Output Directory</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.output_directory}
                                onChange={(e) => handleChange('output_directory', e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Completed Directory</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.completed_directory}
                                onChange={(e) => handleChange('completed_directory', e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Number of CPUs</label>
                            <input
                                type="number"
                                className="form-control"
                                value={settings.num_cpus}
                                onChange={(e) => handleChange('num_cpus', parseInt(e.target.value) || 0)}
                            />
                            <div className="form-text">
                                Number of CPU cores to use for processing (0 = auto)
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Output Scheme</label>
                            <input
                                type="text"
                                className="form-control"
                                value={settings.output_scheme}
                                onChange={(e) => handleChange('output_scheme', e.target.value)}
                            />
                            <div className="form-text">
                                Use "/" for subdirectories. Supported keywords: asin, author, narrator, series_name, series_position, subtitle, title, year
                            </div>
                        </div>
                    </div>
                </div>

                {/* UI Settings Card */}
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-4">UI Settings</h5>

                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="darkModeSwitch"
                                checked={theme === 'dark'}
                                onChange={toggleTheme}
                            />
                            <label className="form-check-label" htmlFor="darkModeSwitch">
                                <i className={`fa-solid fa-${theme === 'dark' ? 'moon' : 'sun'} me-2`}></i>
                                Dark Mode
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            {showUnsavedModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Unsaved Changes</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCancelNavigation}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>You have unsaved changes. What would you like to do?</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancelNavigation}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleDiscardAndLeave}
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleSaveAndLeave}
                                >
                                    Save & Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsPage;
