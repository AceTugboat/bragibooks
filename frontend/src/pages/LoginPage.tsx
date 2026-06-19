import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { passkeyApi, getErrorMessage } from '../api/services';
import { startAuthentication } from '../utils/webauthn';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, checkAuth } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [passkeyLoading, setPasskeyLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        setError(null);
        setPasskeyLoading(true);
        try {
            const options = await passkeyApi.loginBegin();
            const assertion = await startAuthentication(options);
            await passkeyApi.loginComplete(assertion);
            await checkAuth();
            navigate('/');
        } catch (err) {
            const isDomNotAllowed = err instanceof DOMException && err.name === 'NotAllowedError';
            const isUnknownCred = getErrorMessage(err).toLowerCase().includes('unknown credential');
            if (isDomNotAllowed || isUnknownCred) {
                setError(
                    'No passkey found. Sign in with your username and password, then go to Settings → Security to register a passkey.'
                );
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setPasskeyLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <i className="fa-solid fa-scroll auth-icon" />
                    <h2>BragíBooks</h2>
                    <p>Sign in to continue</p>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
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
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                Signing in…
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                {window.PublicKeyCredential && (
                    <>
                        <div className="auth-divider">
                            <hr /><small>or</small><hr />
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-light w-100"
                            onClick={handlePasskeyLogin}
                            disabled={passkeyLoading || loading}
                        >
                            {passkeyLoading ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            ) : (
                                <i className="fa-solid fa-key me-2" />
                            )}
                            Sign in with a passkey
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
