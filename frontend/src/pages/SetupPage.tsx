import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, getErrorMessage } from '../api/services';
import { useAuth } from '../context/AuthContext';

const SetupPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshSetupStatus, checkAuth } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await authApi.initialSetup(username, password, email);
            await refreshSetupStatus();
            await checkAuth();
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <div className="card-body p-4">
                    <div className="text-center mb-4">
                        <div className="mb-3">
                            <i className="fa-solid fa-scroll fa-3x text-gold"></i>
                        </div>
                        <h3 className="mb-2">Welcome to BragíBooks</h3>
                        <p>Create your admin account to get started</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">
                                Username <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email <span className="text-muted">(optional)</span>
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                Password <span className="text-danger">*</span>
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <div className="form-text">
                                Must be at least 8 characters
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password <span className="text-danger">*</span>
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Creating Account...
                                </>
                            ) : (
                                'Create Admin Account'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupPage;
