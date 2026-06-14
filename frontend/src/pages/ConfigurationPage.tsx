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
        archive_directory: '',
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
    const [pathStatus, setPathStatus] = useState<Record<string, string> | null>(null);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validate = (current: Settings): Record<string, string> => {
        const errors: Record<string, string> = {};
        if (!current.api_url.startsWith('http://') && !current.api_url.startsWith('https://')) {
            errors.api_url = 'Must start with http:// or https://';
        }
        if (!current.input_directory || !current.input_directory.startsWith('/')) {
            errors.input_directory = 'Must be an absolute path starting with /';
        }
        if (!current.output_directory || !current.output_directory.startsWith('/')) {
            errors.output_directory = 'Must be an absolute path starting with /';
        }
        if (current.archive_directory && !current.archive_directory.startsWith('/')) {
            errors.archive_directory = 'Must be an absolute path starting with /';
        }
        if (!Number.isInteger(Number(current.num_cpus)) || Number(current.num_cpus) < 0) {
            errors.num_cpus = 'Must be a non-negative integer';
        }
        return errors;
    };

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
        const errors = validate(settings);
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;
        try {
            setError(null);
            await settingsApi.update(settings);
            setOriginalSettings(settings);
            setSuccess(true);
            setPathStatus(null);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleChange = (field: keyof Settings, value: string | number) => {
        const updated = { ...settings, [field]: value };
        setSettings(updated);
        setSuccess(false);
        setPathStatus(null);
        setFieldErrors(validate(updated));
    };

    const handleVerifyPaths = async () => {
        try {
            setVerifyLoading(true);
            const status = await settingsApi.verifyPaths();
            setPathStatus(status);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setVerifyLoading(false);
        }
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

    const renderPathStatus = (field: string) => {
        if (!pathStatus || !(field in pathStatus)) return null;
        const status = pathStatus[field];
        if (status === 'ok') {
            return <small className="text-success d-block mt-1"><i className="fa-solid fa-check me-1"></i>OK</small>;
        }
        if (status === 'missing') {
            return <small className="text-danger d-block mt-1"><i className="fa-solid fa-xmark me-1"></i>Directory not found</small>;
        }
        if (status === 'not_writable') {
            return <small className="text-warning d-block mt-1"><i className="fa-solid fa-triangle-exclamation me-1"></i>Not writable</small>;
        }
        if (status === 'not_configured') {
            return <small className="text-secondary d-block mt-1">Not configured</small>;
        }
        return null;
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
                    className="btn btn-outline-secondary me-2"
                    onClick={handleVerifyPaths}
                    disabled={verifyLoading}
                >
                    {verifyLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Testing...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-circle-check me-2"></i>
                            Test Paths
                        </>
                    )}
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!isDirty || Object.keys(fieldErrors).length > 0}
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
                                className={`form-control${fieldErrors.api_url ? ' is-invalid' : ''}`}
                                value={settings.api_url}
                                onChange={(e) => handleChange('api_url', e.target.value)}
                            />
                            {fieldErrors.api_url && <div className="invalid-feedback">{fieldErrors.api_url}</div>}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Input Directory</label>
                            <input
                                type="text"
                                className={`form-control${fieldErrors.input_directory ? ' is-invalid' : ''}`}
                                value={settings.input_directory}
                                onChange={(e) => handleChange('input_directory', e.target.value)}
                            />
                            {fieldErrors.input_directory
                                ? <div className="invalid-feedback">{fieldErrors.input_directory}</div>
                                : <div className="form-text">Where your source audiobook files live</div>
                            }
                            {renderPathStatus('input_directory')}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Output Directory</label>
                            <input
                                type="text"
                                className={`form-control${fieldErrors.output_directory ? ' is-invalid' : ''}`}
                                value={settings.output_directory}
                                onChange={(e) => handleChange('output_directory', e.target.value)}
                            />
                            {fieldErrors.output_directory
                                ? <div className="invalid-feedback">{fieldErrors.output_directory}</div>
                                : <div className="form-text">Where finished .m4b files are written</div>
                            }
                            {renderPathStatus('output_directory')}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Archive Directory</label>
                            <input
                                type="text"
                                className={`form-control${fieldErrors.archive_directory ? ' is-invalid' : ''}`}
                                value={settings.archive_directory}
                                onChange={(e) => handleChange('archive_directory', e.target.value)}
                            />
                            {fieldErrors.archive_directory
                                ? <div className="invalid-feedback">{fieldErrors.archive_directory}</div>
                                : <div className="form-text">Where source files are moved after processing (leave blank to keep in place)</div>
                            }
                            {settings.archive_directory && settings.input_directory && settings.archive_directory.startsWith(settings.input_directory) && (
                                <div className="alert alert-warning py-2 mb-2 mt-1" role="alert">
                                    <small>Archive directory is inside Input directory. The app may attempt to re-process archived files.</small>
                                </div>
                            )}
                            {renderPathStatus('archive_directory')}
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Number of CPUs</label>
                            <input
                                type="number"
                                className={`form-control${fieldErrors.num_cpus ? ' is-invalid' : ''}`}
                                value={settings.num_cpus}
                                onChange={(e) => handleChange('num_cpus', parseInt(e.target.value) || 0)}
                            />
                            {fieldErrors.num_cpus
                                ? <div className="invalid-feedback">{fieldErrors.num_cpus}</div>
                                : <div className="form-text">Number of CPU cores to use for processing (0 = auto)</div>
                            }
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
                                Available tokens: {'{author}'}, {'{title}'}, {'{series_name}'}, {'{series_position}'}, {'{subtitle}'}, {'{year}'}, {'{asin}'}, {'{narrator}'}
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
