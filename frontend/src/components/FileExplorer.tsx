import React, { useState, useCallback } from 'react';
import type { FileItem } from '../types';

interface FileExplorerProps {
    rootItems: FileItem[];
    selectedPaths: string[];
    onSelectionChange: (paths: string[]) => void;
    fetchChildren: (path: string) => Promise<FileItem[]>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
    rootItems,
    selectedPaths,
    onSelectionChange,
    fetchChildren,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
    const [childrenByPath, setChildrenByPath] = useState<Record<string, FileItem[]>>({});
    const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set());

    const toggleSelection = (path: string) => {
        if (selectedPaths.includes(path)) {
            onSelectionChange(selectedPaths.filter(p => p !== path));
        } else {
            onSelectionChange([...selectedPaths, path]);
        }
    };

    const toggleExpand = useCallback(async (item: FileItem) => {
        const path = item.path;
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
        if (!expandedPaths.has(path) && !childrenByPath[path] && !loadingPaths.has(path)) {
            setLoadingPaths(prev => new Set(prev).add(path));
            try {
                const children = await fetchChildren(path);
                setChildrenByPath(prev => ({ ...prev, [path]: children }));
            } finally {
                setLoadingPaths(prev => {
                    const next = new Set(prev);
                    next.delete(path);
                    return next;
                });
            }
        }
    }, [expandedPaths, childrenByPath, fetchChildren]);

    const fuzzyMatch = (needle: string, haystack: string): boolean => {
        const n = needle.toLowerCase();
        const h = haystack.toLowerCase();
        let j = 0;
        for (let i = 0; i < n.length; i++) {
            while (j < h.length && h[j] !== n[i]) j++;
            if (j >= h.length) return false;
            j++;
        }
        return true;
    };

    const renderItem = (item: FileItem, depth = 0): React.ReactNode => {
        const isSelected = selectedPaths.includes(item.path);
        const isExpanded = expandedPaths.has(item.path);
        const isLoading = loadingPaths.has(item.path);
        const children = childrenByPath[item.path] ?? [];

        if (searchQuery && !fuzzyMatch(searchQuery, item.name)) {
            return null;
        }

        return (
            <React.Fragment key={item.path}>
                <label
                    className="list-group-item list-group-item-action d-flex align-items-center justify-content-between py-2"
                    style={{ paddingLeft: `${0.75 + depth * 1.5}rem`, cursor: 'pointer' }}
                >
                    <div className="d-flex align-items-center gap-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(item.path)}
                        />
                        <span className={item.is_directory ? 'text-warning' : 'text-secondary'}>
                            <i className={`fas ${item.is_directory ? 'fa-folder' : 'fa-file'}`} />
                        </span>
                        <span>{item.name}</span>
                    </div>
                    {item.is_directory && item.has_children && (
                        <button
                            type="button"
                            className="btn btn-link btn-sm p-0 ms-2"
                            onClick={e => { e.preventDefault(); toggleExpand(item); }}
                        >
                            {isLoading
                                ? <span className="spinner-border spinner-border-sm" />
                                : <i className={`fas fa-angle-right ${isExpanded ? 'fa-rotate-90' : ''}`} />
                            }
                        </button>
                    )}
                </label>
                {isExpanded && !searchQuery && children.map(child => renderItem(child, depth + 1))}
            </React.Fragment>
        );
    };

    return (
        <div>
            <div className="p-3 border-bottom">
                <div className="input-group">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Search files and directories..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearchQuery('')}
                    >
                        <i className="fas fa-times" />
                    </button>
                </div>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: 'calc(100vh - 350px)', overflowY: 'auto' }}>
                {rootItems.length === 0 ? (
                    <div className="list-group-item text-center text-muted">No files or directories found</div>
                ) : (
                    rootItems.map(item => renderItem(item))
                )}
            </div>
        </div>
    );
};

export default FileExplorer;
