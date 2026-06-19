import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import type { VersionInfo } from '../types';
import { settingsApi, getErrorMessage } from '../api/services';

const AboutPage: React.FC = () => {
    const [versions, setVersions] = useState<VersionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadVersions();
    }, []);

    const loadVersions = async () => {
        try {
            setLoading(true);
            const data = await settingsApi.getVersions();
            setVersions(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
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
            <PageHeader title="About BragíBooks" />

            <div className="container-fluid px-4 py-3">
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title mb-3">About</h5>
                        <p className="mb-2">
                            <strong>BragíBooks</strong> is an audiobook library cleanup and management application.
                        </p>
                        <p className="mb-0">
                            Named after Bragi, the god of poetry in Norse mythology, this application helps you
                            organize and manage your audiobook collection with ease.
                        </p>
                    </div>
                </div>

                {versions && (
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Version Information</h5>
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="small">BragíBooks</div>
                                    <div className="fw-bold">v{versions.bragibooks_version}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="small">Django</div>
                                    <div className="fw-bold">v{versions.django_version}</div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="small">m4b-merge</div>
                                    <div className="fw-bold">{versions.m4b_merge_version === 'unknown' ? 'Not detected' : `v${versions.m4b_merge_version}`}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title mb-3">Links</h5>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                <i className="fab fa-github me-2"></i>
                                <a
                                    href="https://github.com/AceTugboat/bragibooks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                >
                                    GitHub Repository
                                </a>
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-book me-2"></i>
                                <a
                                    href="https://github.com/djdembeck/m4b-merge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                >
                                    m4b-merge Documentation
                                </a>
                            </li>
                            <li className="mb-0">
                                <i className="fas fa-bug me-2"></i>
                                <a
                                    href="https://github.com/AceTugboat/bragibooks/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                >
                                    Report Issues
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutPage;
