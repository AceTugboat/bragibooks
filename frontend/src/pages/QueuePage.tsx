import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import type { Book, FileItem } from '../types';
import { bookApi, directoryApi, getErrorMessage } from '../api/services';

// Helper to find all deepest parent folders (folders that contain files)
const findDeepestParentFolders = (item: FileItem): string[] => {
    if (!item.is_directory) return [];

    const results: string[] = [];

    // Check if this folder directly contains any files
    const hasFiles = item.children?.some(child => !child.is_directory);
    if (hasFiles) {
        results.push(item.path);
    }

    // Recurse into subdirectories
    item.children?.forEach(child => {
        if (child.is_directory) {
            results.push(...findDeepestParentFolders(child));
        }
    });

    return results;
};

// Recursive File Tree Item Component
interface FileTreeItemProps {
    item: FileItem;
    depth: number;
    selectedPaths: string[];
    expandedFolders: Set<string>;
    onTogglePath: (path: string) => void;
    onToggleFolder: (path: string) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
    item,
    depth,
    selectedPaths,
    expandedFolders,
    onTogglePath,
    onToggleFolder,
}) => {
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.is_directory && item.children && item.children.length > 0;

    // Check if this item is selected
    const isItemSelected = () => {
        if (!item.is_directory) {
            return selectedPaths.includes(item.path);
        }

        // For folders, check if all importable descendants are selected
        const importableFolders = findDeepestParentFolders(item);
        return importableFolders.length > 0 && importableFolders.every(path => selectedPaths.includes(path));
    };

    return (
        <>
            <div
                className="list-group-item list-group-item-action d-flex align-items-center"
                style={{
                    cursor: 'pointer',
                    paddingLeft: `${depth * 20 + 12}px`
                }}
            >
                {item.is_directory && (
                    <i
                        className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'} me-2 text-muted`}
                        style={{ fontSize: '0.75rem', width: '12px', cursor: 'pointer' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFolder(item.path);
                        }}
                    ></i>
                )}
                {!item.is_directory && (
                    <span style={{ width: '12px', marginRight: '0.5rem' }}></span>
                )}
                <input
                    type="checkbox"
                    className="form-check-input me-3"
                    checked={isItemSelected()}
                    onChange={() => onTogglePath(item.path)}
                    onClick={(e) => e.stopPropagation()}
                />
                <i
                    className={`fa-solid fa-${item.is_directory ? 'folder' : 'file-audio'} me-2`}
                    onClick={() => item.is_directory && onToggleFolder(item.path)}
                ></i>
                <div
                    className="flex-grow-1"
                    style={{ minWidth: 0 }}
                    onClick={() => item.is_directory ? onToggleFolder(item.path) : onTogglePath(item.path)}
                >
                    <div className="text-truncate" title={item.name}>{item.name}</div>
                    {!item.is_directory && (
                        <small className="text-muted">
                            {(item.size / (1024 * 1024)).toFixed(2)} MB
                        </small>
                    )}
                </div>
            </div>

            {/* Render children if folder is expanded */}
            {item.is_directory && isExpanded && hasChildren && (
                <>
                    {item.children!.map((child) => (
                        <FileTreeItem
                            key={child.path}
                            item={child}
                            depth={depth + 1}
                            selectedPaths={selectedPaths}
                            expandedFolders={expandedFolders}
                            onTogglePath={onTogglePath}
                            onToggleFolder={onToggleFolder}
                        />
                    ))}
                </>
            )}
        </>
    );
};

// Queue item component
interface QueueItemProps {
    book: Book;
}

const QueueItem: React.FC<QueueItemProps> = ({ book }) => {
    // Determine status badge based on book status
    const getStatusInfo = () => {
        const statusText = book.status?.status || 'Processing';

        if (statusText === 'Processing') {
            return { label: 'Processing', variant: 'primary', progress: 50 };
        } else if (statusText === 'Done') {
            return { label: 'Complete', variant: 'success', progress: 100 };
        } else if (statusText === 'Error') {
            return { label: 'Error', variant: 'danger', progress: 0 };
        }
        return { label: 'Processing', variant: 'secondary', progress: 50 };
    };

    const status = getStatusInfo();
    const authors = book.authors?.map(a => `${a.first_name} ${a.last_name} `).join(', ') || 'Unknown Author';

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-auto">
                        {book.cover_image_link ? (
                            <img
                                src={book.cover_image_link}
                                alt={book.title}
                                style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                        ) : (
                            <div
                                className="bg-secondary d-flex align-items-center justify-content-center"
                                style={{ width: '60px', height: '90px', borderRadius: '4px' }}
                            >
                                <i className="fa-solid fa-book text-white"></i>
                            </div>
                        )}
                    </div>
                    <div className="col">
                        <h6 className="mb-1">{book.title}</h6>
                        <p className="text-muted small mb-2">{authors}</p>
                        <div className="d-flex align-items-center gap-3">
                            <span className={`badge bg-${status.variant}`}>{status.label}</span>
                            {status.progress > 0 && status.progress < 100 && (
                                <div className="flex-grow-1" style={{ maxWidth: '300px' }}>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className={`progress-bar bg-${status.variant}`}
                                            role="progressbar"
                                            style={{ width: `${status.progress}%` }}
                                            aria-valuenow={status.progress}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Queue Page Component
const QueuePage: React.FC = () => {
    const [processingBooks, setProcessingBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
    const [directoryContents, setDirectoryContents] = useState<FileItem[]>([]);
    const [loadingDirectory, setLoadingDirectory] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadBooks();
    }, []);

    // Load directory contents when modal opens
    useEffect(() => {
        if (showImportModal) {
            loadDirectory();
        }
    }, [showImportModal]);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const data = await bookApi.getAll();
            // Combine processing and error books for the queue
            setProcessingBooks([...data.processing, ...data.error]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // Build tree structure from flat list
    const buildFileTree = (items: FileItem[]): FileItem[] => {
        // Create a map for quick lookup
        const itemMap = new Map<string, FileItem & { children: FileItem[] }>();

        // Initialize all items in the map with empty children arrays
        items.forEach(item => {
            itemMap.set(item.path, { ...item, children: [] });
        });

        // Build the tree by assigning children to parents
        const rootItems: FileItem[] = [];

        items.forEach(item => {
            const itemWithChildren = itemMap.get(item.path)!;
            const parentPath = item.path.substring(0, item.path.lastIndexOf('/'));

            // If item has a parent in our map, add it as a child
            if (parentPath && itemMap.has(parentPath)) {
                const parent = itemMap.get(parentPath)!;
                parent.children.push(itemWithChildren);
            } else {
                // This is a root-level item
                rootItems.push(itemWithChildren);
            }
        });

        // Sort children alphabetically (directories first, then files)
        const sortItems = (items: FileItem[]) => {
            items.sort((a, b) => {
                // Directories come before files
                if (a.is_directory && !b.is_directory) return -1;
                if (!a.is_directory && b.is_directory) return 1;
                // Otherwise sort alphabetically
                return a.name.localeCompare(b.name);
            });
            // Recursively sort children
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    sortItems(item.children);
                }
            });
        };

        sortItems(rootItems);
        return rootItems;
    };

    const loadDirectory = async () => {
        try {
            setLoadingDirectory(true);
            const data = await directoryApi.getContents();
            const treeStructure = buildFileTree(data.contents ?? []);
            setDirectoryContents(treeStructure);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoadingDirectory(false);
        }
    };

    // Helper to find an item in the tree by path
    const findItemByPath = (items: FileItem[], path: string): FileItem | null => {
        for (const item of items) {
            if (item.path === path) {
                return item;
            }
            if (item.children) {
                const found = findItemByPath(item.children, path);
                if (found) return found;
            }
        }
        return null;
    };

    const togglePath = (path: string) => {
        // Find the item in the tree
        const item = findItemByPath(directoryContents, path);

        if (item && item.is_directory) {
            // For directories, find and toggle all deepest parent folders
            const deepestFolders = findDeepestParentFolders(item);

            setSelectedPaths(prev => {
                // Check if all deepest folders are already selected
                const allSelected = deepestFolders.every(folderPath => prev.includes(folderPath));

                if (allSelected) {
                    // Deselect all deepest folders
                    return prev.filter(p => !deepestFolders.includes(p));
                } else {
                    // Select all deepest folders (remove any that were already there to avoid duplicates)
                    const filtered = prev.filter(p => !deepestFolders.includes(p));
                    return [...filtered, ...deepestFolders];
                }
            });
        } else {
            // For files, toggle normally
            setSelectedPaths(prev => {
                if (prev.includes(path)) {
                    return prev.filter(p => p !== path);
                } else {
                    return [...prev, path];
                }
            });
        }
    };

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    };

    const handleImport = async () => {
        if (selectedPaths.length === 0) return;

        // TODO: Call directoryApi.startImport with selected paths
        console.log('Importing books from paths:', selectedPaths);

        // Close modal and reset
        setShowImportModal(false);
        setSelectedPaths([]);
    };

    const handleCloseModal = () => {
        setShowImportModal(false);
        setSelectedPaths([]);
    };

    if (loading) {
        return (
            <div className="text-center my-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-4" role="alert">
                {error}
            </div>
        );
    }

    return (
        <>
            <PageHeader title={`Processing Queue(${processingBooks.length})`}>
                <button
                    className="btn btn-success"
                    onClick={() => setShowImportModal(true)}
                    title="Import books from Input Directory"
                >
                    <i className="fa-solid fa-file-import me-2"></i>
                    Import Books
                </button>
            </PageHeader>

            <div className="container-fluid px-4 py-3">
                {processingBooks.length > 0 ? (
                    processingBooks.map(book => (
                        <QueueItem key={book.id} book={book} />
                    ))
                ) : (
                    <div className="card">
                        <div className="card-body text-center py-5">
                            <i className="fa-solid fa-clock fa-3x mb-3 text-muted"></i>
                            <h4>Queue is Empty</h4>
                            <p className="text-muted">
                                No books are currently being processed.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa-solid fa-file-import me-2"></i>
                                    Import Books from Input Directory
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                    aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body" style={{ minHeight: '60vh' }}>
                                <div className="row h-100">
                                    {/* Left 2/3 (LG) / Full (Mobile): Directory Browser */}
                                    <div className="col-lg-8 col-12 mb-3 mb-lg-0 border-end d-lg-block" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                        <h6 className="mb-3">Select Files/Folders</h6>
                                        {loadingDirectory ? (
                                            <div className="text-center py-5">
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="mt-2 text-muted">Loading directory contents...</p>
                                            </div>
                                        ) : directoryContents.length > 0 ? (
                                            <div className="list-group list-group-flush">
                                                {directoryContents.map((item) => (
                                                    <FileTreeItem
                                                        key={item.path}
                                                        item={item}
                                                        depth={0}
                                                        selectedPaths={selectedPaths}
                                                        expandedFolders={expandedFolders}
                                                        onTogglePath={togglePath}
                                                        onToggleFolder={toggleFolder}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-5 text-muted">
                                                <i className="fa-solid fa-folder-open fa-3x mb-3"></i>
                                                <p>No files or folders found in Input Directory</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right 1/3 (LG) / Full (Mobile): Selected Items */}
                                    <div className="col-lg-4 col-12" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                        <h6 className="mb-3">Selected ({selectedPaths.length})</h6>
                                        {selectedPaths.length > 0 ? (
                                            <div className="list-group list-group-flush" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                                {selectedPaths.map((path) => {
                                                    const item = findItemByPath(directoryContents, path);
                                                    const displayName = item?.name || path.split('/').pop() || path;
                                                    return (
                                                        <div
                                                            key={path}
                                                            className="list-group-item d-flex align-items-center justify-content-between"
                                                        >
                                                            <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0 }}>
                                                                <i className={`fa-solid fa-${item?.is_directory ? 'folder' : 'file-audio'} me-2`}></i>
                                                                <span className="text-truncate" title={path}>{displayName}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-link text-danger p-0 ms-2"
                                                                onClick={() => togglePath(path)}
                                                                title="Remove"
                                                            >
                                                                <i className="fa-solid fa-times"></i>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center text-muted py-4">
                                                <i className="fa-solid fa-hand-pointer fa-2x mb-2"></i>
                                                <p className="small">Select files or folders from the left</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleImport}
                                    disabled={selectedPaths.length === 0}
                                >
                                    <i className="fa-solid fa-file-import me-2"></i>
                                    Import {selectedPaths.length > 0 && `(${selectedPaths.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QueuePage;
