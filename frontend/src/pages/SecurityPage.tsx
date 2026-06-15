import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import type { PasskeyCredential } from '../types';
import { passkeyApi, getErrorMessage } from '../api/services';
import { startRegistration } from '../utils/webauthn';

const SecurityPage: React.FC = () => {
    const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [registering, setRegistering] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const webauthnSupported = !!window.PublicKeyCredential;

    const loadPasskeys = async () => {
        try {
            const data = await passkeyApi.list();
            setPasskeys(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPasskeys(); }, []);

    const handleRegister = async () => {
        setError(null);
        setRegistering(true);
        try {
            const options = await passkeyApi.registerBegin();
            const credential = await startRegistration(options, newName || 'My Passkey');
            await passkeyApi.registerComplete(credential);
            setNewName('');
            await loadPasskeys();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setRegistering(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await passkeyApi.delete(id);
            setDeleteId(null);
            await loadPasskeys();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <>
            <PageHeader title="Security" />
            <div className="container-fluid px-4 py-3">
                {error && (
                    <div className="alert alert-danger alert-dismissible" role="alert">
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)} />
                    </div>
                )}

                {!webauthnSupported && (
                    <div className="alert alert-warning" role="alert">
                        <i className="fa-solid fa-triangle-exclamation me-2" />
                        Your browser does not support passkeys (WebAuthn). Use a modern browser to register a passkey.
                    </div>
                )}

                <div className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Registered Passkeys</h5>
                        {loading ? (
                            <div className="text-center py-3">
                                <div className="spinner-border" role="status" />
                            </div>
                        ) : passkeys.length === 0 ? (
                            <p className="text-muted">No passkeys registered yet.</p>
                        ) : (
                            <ul className="list-group list-group-flush mb-3">
                                {passkeys.map(pk => (
                                    <li key={pk.id} className="list-group-item d-flex align-items-center justify-content-between">
                                        <div>
                                            <div className="fw-semibold">{pk.name || 'Unnamed'}</div>
                                            <small className="text-muted">
                                                Added {new Date(pk.created_at).toLocaleDateString()}
                                                {pk.last_used_at && ` · Last used ${new Date(pk.last_used_at).toLocaleDateString()}`}
                                            </small>
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => setDeleteId(pk.id)}
                                        >
                                            <i className="fa-solid fa-trash" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {webauthnSupported && (
                            <div className="mt-3">
                                <h6>Add a Passkey</h6>
                                <div className="input-group" style={{ maxWidth: 400 }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Passkey name (e.g. MacBook)"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        disabled={registering}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRegister}
                                        disabled={registering}
                                    >
                                        {registering ? (
                                            <span className="spinner-border spinner-border-sm" />
                                        ) : 'Register'}
                                    </button>
                                </div>
                                <small className="text-muted d-block mt-1">
                                    Your browser will prompt you to authenticate with a biometric or device PIN.
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {deleteId !== null && (
                <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Remove Passkey</h5>
                                <button type="button" className="btn-close" onClick={() => setDeleteId(null)} />
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to remove this passkey? You will no longer be able to sign in with it.</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SecurityPage;
