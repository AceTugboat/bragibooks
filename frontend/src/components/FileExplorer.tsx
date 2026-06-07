import React, { useState } from 'react';
import type { FileItem } from '../types';

interface FileExplorerProps {
    contents: FileItem[];
    selectedPaths: string[];
    onSelectionChange: (paths: string[]) => void;
}

interface TreeNode {
    path: string;
    name: string;
    isDirectory: boolean;
    createdAt: number;
    modifiedAt: number;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ contents, selectedPaths, onSelectionChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // TODO: Add sorting functionality (by name, date created, date modified)
    // Need to fix hierarchy maintenance when sorting

    // Build tree structure from file items
    const buildTree = (): TreeNode[] => {
        return contents.map(item => ({
            path: item.path,
            name: item.name,
            isDirectory: item.is_directory,
            createdAt: item.created_at,
            modifiedAt: item.modified_at,
        }));
    };

    const tree = buildTree();

    // Fuzzy match helper
    const fuzzyMatch = (needle: string, haystack: string): boolean => {
        const nlen = needle.length;
        const hlen = haystack.length;
        if (nlen > hlen) return false;
        if (nlen === hlen) return needle === haystack;

        outer: for (let i = 0, j = 0; i < nlen; i++) {
            const nch = needle.charCodeAt(i);
            while (j < hlen) {
                if (haystack.charCodeAt(j++) === nch) {
                    continue outer;
                }
            }
            return false;
        }
        return true;
    };

    // Filter items based on search and parent folder expansion
    const getVisibleItems = (): TreeNode[] => {
        if (searchQuery) {
            // When searching, show all matching items regardless of hierarchy
            const query = searchQuery.toLowerCase();
            return tree.filter(node => fuzzyMatch(query, node.name.toLowerCase()));
        }

        // When not searching, respect the folder hierarchy
        if (tree.length === 0) return [];

        // Find the minimum depth to determine what's actually at root level
        const minDepth = Math.min(...tree.map(node => node.path.split('/').length));

        return tree.filter(node => {
            const parts = node.path.split('/');
            const itemDepth = parts.length;

            // Show root-level items (items at the minimum depth)
            if (itemDepth === minDepth) {
                return true;
            }

            // For nested items, get the direct parent path
            const parentPath = parts.slice(0, -1).join('/');

            // Check if the direct parent is expanded
            return expandedFolders.has(parentPath);
        });
    };

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);

            if (next.has(path)) {
                // Closing this folder - also close all nested folders
                next.delete(path);

                // Remove all folders that start with this path (are children of this folder)
                Array.from(next).forEach(expandedPath => {
                    if (expandedPath.startsWith(path + '/')) {
                        next.delete(expandedPath);
                    }
                });
            } else {
                // Opening this folder
                next.add(path);
            }

            return next;
        });
    };

    const toggleSelection = (path: string) => {
        if (selectedPaths.includes(path)) {
            onSelectionChange(selectedPaths.filter(p => p !== path));
        } else {
            onSelectionChange([...selectedPaths, path]);
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            onSelectionChange([]);
        } else {
            onSelectionChange(tree.map(node => node.path));
        }
        setSelectAll(!selectAll);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setExpandedFolders(new Set());
    };

    const visibleItems = getVisibleItems();

    // Sort by date created (newest first) - maintains hierarchy naturally
    const sortedItems = [...visibleItems].sort((a, b) => b.createdAt - a.createdAt);

    // Calculate indentation level for each item
    const getIndentLevel = (path: string): number => {
        if (tree.length === 0) return 0;
        const minDepth = Math.min(...tree.map(node => node.path.split('/').length));
        const itemDepth = path.split('/').length;
        return Math.max(0, itemDepth - minDepth);
    };

    // Debug: log to see what we have
    console.log('FileExplorer contents:', contents);
    console.log('FileExplorer tree:', tree);
    console.log('FileExplorer sortedItems:', sortedItems);

    return (
        <div>
            {/* Search Bar */}
            <div className="p-3 border-bottom">
                <div className="input-group">
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Search files and directories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className="btn btn-outline-secondary"
                        type="button"
                        title="Clear search"
                        onClick={clearSearch}
                    >
                        <i className="fas fa-times" aria-hidden="false"></i>
                    </button>
                </div>
            </div>

            {/* Select All */}
            <div className="p-3 border-bottom">
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="selectAllCheckbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                    />
                    <label className="form-check-label" htmlFor="selectAllCheckbox">
                        Select All
                    </label>
                </div>
            </div>

            {/* File Tree */}
            <div className="list-group list-group-flush" style={{ height: 'calc(100vh - 450px)', overflowY: 'auto' }}>
                {sortedItems.length === 0 ? (
                    <div className="list-group-item text-center text-muted">
                        No files or directories found
                    </div>
                ) : (
                    sortedItems.map(node => {
                        const isSelected = selectedPaths.includes(node.path);
                        const isExpanded = expandedFolders.has(node.path);
                        const indentLevel = getIndentLevel(node.path);

                        return (
                            <label
                                key={node.path}
                                className="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
                                style={{ cursor: 'pointer', paddingLeft: `${0.75 + indentLevel * 1.5}rem` }}
                            >
                                <div className="d-flex align-items-center">
                                    <input
                                        className="form-check-input me-2"
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSelection(node.path)}
                                    />
                                    <span className={`me-2 ${node.isDirectory ? 'text-warning' : 'text-secondary'}`}>
                                        <i className={`fas ${node.isDirectory ? 'fa-folder' : 'fa-file'}`} aria-hidden="false"></i>
                                    </span>
                                    {node.name}
                                </div>
                                {node.isDirectory && (
                                    <span className="arrow ms-auto" onClick={(e) => { e.preventDefault(); toggleFolder(node.path); }}>
                                        <i className={`fas fa-angle-right ${isExpanded ? 'fa-rotate-90' : ''}`}></i>
                                    </span>
                                )}
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FileExplorer;
