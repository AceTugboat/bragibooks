import React from 'react';
import PageHeader from '../components/PageHeader';

const ImportHistoryPage: React.FC = () => {
    return (
        <>
            <PageHeader title="Import History" />

            <div className="container-fluid px-4 py-3">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <i className="fa-solid fa-history fa-3x mb-3 text-muted"></i>
                        <h4>Import History</h4>
                        <p className="text-muted">
                            This feature is coming soon! You'll be able to view your complete import history here.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImportHistoryPage;
