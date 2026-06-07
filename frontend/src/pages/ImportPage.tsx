import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileExplorer from '../components/FileExplorer';
import { directoryApi, getErrorMessage } from '../api/services';
import type { FileItem } from '../types';

const ImportPage: React.FC = () => {
    const navigate = useNavigate();
    const [contents, setContents] = useState<FileItem[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDirectories();
    }, []);

    const loadDirectories = async () => {
        try {
            setLoading(true);
            const data = await directoryApi.getContents();
            setContents(data.contents);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (selectedPaths.length === 0) {
            setError('You must select content to import');
            return;
        }

        try {
            await directoryApi.startImport(selectedPaths);
            navigate('/match');
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    if (loading) {
        return (
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">Choose Files or Directories to process</h5>
                    </div>
                    <div className="card-body p-0">
                        {error && (
                            <div className="alert alert-danger m-3" role="alert">
                                {error}
                            </div>
                        )}
                        <FileExplorer
                            contents={contents}
                            selectedPaths={selectedPaths}
                            onSelectionChange={setSelectedPaths}
                        />
                        <div className="p-3">
                            <button className="btn btn-primary w-100" onClick={handleNext}>
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportPage;
