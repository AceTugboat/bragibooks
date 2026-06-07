import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import type { User } from '../api/services';
import { usersApi, getErrorMessage } from '../api/services';
import { useAuth } from '../context/AuthContext';

const UserManagementPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        is_superuser: false,
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getAll();
            setUsers(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            is_superuser: false,
        });
        setShowAddModal(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            confirmPassword: '',
            is_superuser: user.is_superuser,
        });
        setShowEditModal(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
            return;
        }

        try {
            await usersApi.delete(user.id);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            await usersApi.create({
                username: formData.username,
                password: formData.password,
                email: formData.email,
                is_superuser: formData.is_superuser,
            });
            setShowAddModal(false);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleSubmitEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedUser) return;

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password && formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        try {
            const updateData: any = {
                email: formData.email,
                is_superuser: formData.is_superuser,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await usersApi.update(selectedUser.id, updateData);
            setShowEditModal(false);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err));
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
            <PageHeader title="User Management">
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="fas fa-plus me-2"></i>
                    Add User
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

                <div className="card">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email || <span>—</span>}</td>
                                            <td>
                                                {user.is_superuser ? (
                                                    <span className="badge bg-primary">Admin</span>
                                                ) : (
                                                    <span className="badge bg-secondary">User</span>
                                                )}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-2"
                                                    onClick={() => handleEdit(user)}
                                                >
                                                    <i className="fas fa-edit"></i> Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(user)}
                                                    disabled={user.id === currentUser?.id}
                                                >
                                                    <i className="fas fa-trash"></i> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add New User</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAddModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <form onSubmit={handleSubmitAdd}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Username *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                        <div className="form-text">Must be at least 8 characters</div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm Password *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="is_superuser_add"
                                            checked={formData.is_superuser}
                                            onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                        />
                                        <label className="form-check-label" htmlFor="is_superuser_add">
                                            Administrator
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Close
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit User: {selectedUser.username}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowEditModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <form onSubmit={handleSubmitEdit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">New Password (leave blank to keep current)</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                        <div className="form-text">Must be at least 8 characters</div>
                                    </div>
                                    {formData.password && (
                                        <div className="mb-3">
                                            <label className="form-label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    )}
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="is_superuser_edit"
                                            checked={formData.is_superuser}
                                            onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                                        />
                                        <label className="form-check-label" htmlFor="is_superuser_edit">
                                            Administrator
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Close
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update User
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManagementPage;
