import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { bookApi, settingsApi, getErrorMessage } from '../api/services';
import type { Book, Settings, VersionInfo } from '../types';
import type { Toast } from '../components/ToastContainer';

interface BooksData {
    done: Book[];
    processing: Book[];
    error: Book[];
}

interface DataContextType {
    books: BooksData;
    settings: Settings | null;
    versions: VersionInfo | null;
    loadingBooks: boolean;
    loadingSettings: boolean;
    errorBooks: string | null;
    errorSettings: string | null;
    toasts: Toast[];
    refreshBooks: () => Promise<void>;
    refreshSettings: () => Promise<void>;
    dismissToast: (id: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

let toastCounter = 0;

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [books, setBooks] = useState<BooksData>({ done: [], processing: [], error: [] });
    const [settings, setSettings] = useState<Settings | null>(null);
    const [versions, setVersions] = useState<VersionInfo | null>(null);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [errorBooks, setErrorBooks] = useState<string | null>(null);
    const [errorSettings, setErrorSettings] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const prevProcessingRef = useRef<Book[]>([]);
    const prevProcessingLengthRef = useRef(0);

    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const refreshBooks = useCallback(async () => {
        try {
            setLoadingBooks(true);
            const data = await bookApi.getAll();

            // Detect PROCESSING → DONE or ERROR transitions
            const prevIds = new Set(prevProcessingRef.current.map(b => b.id));
            const prevById = new Map(prevProcessingRef.current.map(b => [b.id, b]));
            const nowProcessingIds = new Set(data.processing.map(b => b.id));
            const nowErrorIds = new Set(data.error.map(b => b.id));

            const newToasts: Toast[] = [];
            for (const id of prevIds) {
                const prev = prevById.get(id)!;
                if (nowErrorIds.has(id)) {
                    newToasts.push({ id: ++toastCounter, type: 'error', bookId: id, title: prev.title });
                } else if (!nowProcessingIds.has(id)) {
                    // Was processing, not in error → must be done
                    newToasts.push({ id: ++toastCounter, type: 'done', bookId: id, title: prev.title });
                }
            }
            if (newToasts.length > 0) {
                setToasts(prev => [...prev, ...newToasts]);
                newToasts.forEach(t => {
                    setTimeout(() => dismissToast(t.id), 8000);
                });
            }

            prevProcessingRef.current = data.processing;
            setBooks(data);
            setErrorBooks(null);
        } catch (err) {
            setErrorBooks(getErrorMessage(err));
        } finally {
            setLoadingBooks(false);
        }
    }, [dismissToast]);

    const refreshSettings = useCallback(async () => {
        try {
            setLoadingSettings(true);
            const [settingsData, versionsData] = await Promise.all([
                settingsApi.get(),
                settingsApi.getVersions(),
            ]);
            setSettings(settingsData);
            setVersions(versionsData);
            setErrorSettings(null);
        } catch (err) {
            setErrorSettings(getErrorMessage(err));
        } finally {
            setLoadingSettings(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshBooks();
        refreshSettings();
    }, []);

    // When processing empties, do one follow-up fetch after a short delay so
    // books that just finished (backend still committing) land in recently completed.
    useEffect(() => {
        const prev = prevProcessingLengthRef.current;
        prevProcessingLengthRef.current = books.processing.length;
        if (prev > 0 && books.processing.length === 0) {
            const timer = setTimeout(refreshBooks, 1500);
            return () => clearTimeout(timer);
        }
    }, [books.processing.length, refreshBooks]);

    // When processing empties, do one follow-up fetch after a short delay so
    // books that just finished (backend still committing) land in recently completed.
    useEffect(() => {
        const prev = prevProcessingLengthRef.current;
        prevProcessingLengthRef.current = books.processing.length;
        if (prev > 0 && books.processing.length === 0) {
            const timer = setTimeout(refreshBooks, 1500);
            return () => clearTimeout(timer);
        }
    }, [books.processing.length, refreshBooks]);

    return (
        <DataContext.Provider value={{
            books, settings, versions,
            loadingBooks, loadingSettings,
            errorBooks, errorSettings,
            toasts, refreshBooks, refreshSettings, dismissToast,
        }}>
            {children}
        </DataContext.Provider>
    );
};

