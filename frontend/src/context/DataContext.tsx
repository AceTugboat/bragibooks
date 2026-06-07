import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { bookApi, settingsApi, getErrorMessage } from '../api/services';
import type { Book, Settings, VersionInfo } from '../types';

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
    refreshBooks: () => Promise<void>;
    refreshSettings: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

interface DataProviderProps {
    children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [books, setBooks] = useState<BooksData>({ done: [], processing: [], error: [] });
    const [settings, setSettings] = useState<Settings | null>(null);
    const [versions, setVersions] = useState<VersionInfo | null>(null);

    const [loadingBooks, setLoadingBooks] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);

    const [errorBooks, setErrorBooks] = useState<string | null>(null);
    const [errorSettings, setErrorSettings] = useState<string | null>(null);

    useEffect(() => {
        refreshBooks();
        refreshSettings();
    }, []);

    const refreshBooks = async () => {
        try {
            setLoadingBooks(true);
            const data = await bookApi.getAll();
            setBooks(data);
            setErrorBooks(null);
        } catch (err) {
            setErrorBooks(getErrorMessage(err));
        } finally {
            setLoadingBooks(false);
        }
    };

    const refreshSettings = async () => {
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
    };

    const value = {
        books,
        settings,
        versions,
        loadingBooks,
        loadingSettings,
        errorBooks,
        errorSettings,
        refreshBooks,
        refreshSettings,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
