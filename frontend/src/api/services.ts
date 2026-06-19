import apiClient from './client';
import type {
    Book,
    Chapter,
    Settings,
    DirectoryContents,
    AsinSearchResult,
    VersionInfo,
    PasskeyCredential,
} from '../types';

export interface User {
    id: number;
    username: string;
    email: string;
    is_staff: boolean;
    is_superuser: boolean;
}

export interface SetupStatus {
    setup_needed: boolean;
}

// Error message helper
export const getErrorMessage = (error: any): string => {
    if (error.response?.data?.error) {
        return error.response.data.error;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

// Directory/File operations
export const directoryApi = {
    getContents: async (path?: string): Promise<DirectoryContents> => {
        const params = path ? { path } : {};
        const response = await apiClient.get<DirectoryContents>('/api/import/files/', { params });
        return response.data;
    },

    startImport: async (selectedPaths: string[]): Promise<void> => {
        await apiClient.post('/api/import/start/', { input_dir: selectedPaths });
    },
};

// Book operations
export const bookApi = {
    getAll: async (): Promise<{ done: Book[]; processing: Book[]; error: Book[] }> => {
        const response = await apiClient.get('/api/books/');
        return response.data;
    },

    getById: async (id: string): Promise<Book> => {
        const response = await apiClient.get<Book>(`/api/books/${id}/`);
        return response.data;
    },

    matchAsin: async (matches: Record<string, string>): Promise<void> => {
        await apiClient.post('/api/match/', matches);
    },

    getInputDirectories: async (): Promise<string[]> => {
        const response = await apiClient.get<{ input_dirs: string[] }>('/api/match/');
        return response.data.input_dirs;
    },

    delete: async (id: string | number): Promise<void> => {
        await apiClient.delete(`/api/books/${id}/`);
    },

    reprocess: async (id: string | number, asin?: string): Promise<void> => {
        await apiClient.post(`/api/books/${id}/reprocess/`, asin ? { asin } : {});
    },

    updateMetadata: async (id: string | number, data: {
        title?: string; author?: string; narrator?: string;
        year?: number; description?: string; genre?: string;
    }): Promise<Book> => {
        const response = await apiClient.put<Book>(`/api/books/${id}/metadata/`, data);
        return response.data;
    },

    getChapters: async (id: string | number): Promise<Chapter[]> => {
        const response = await apiClient.get<Chapter[]>(`/api/books/${id}/chapters/`);
        return response.data;
    },

    saveChapters: async (id: string | number, chapters: Chapter[]): Promise<{ message?: string } | void> => {
        const res = await apiClient.put<{ saved?: boolean; embedded?: boolean; message?: string }>(`/api/books/${id}/chapters/`, chapters);
        return res.data;
    },

    replaceCoverUpload: async (id: string | number, file: File): Promise<void> => {
        const form = new FormData();
        form.append('mode', 'upload');
        form.append('cover', file);
        await apiClient.post(`/api/books/${id}/cover/`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    replaceCoverRefetch: async (id: string | number): Promise<void> => {
        await apiClient.post(`/api/books/${id}/cover/`, { mode: 'refetch' });
    },

    cancel: async (id: string | number): Promise<void> => {
        await apiClient.post(`/api/books/${id}/cancel/`);
    },
};

// ASIN Search
export const asinSearchApi = {
    search: async (params: {
        media_dir?: string;
        title?: string;
        author?: string;
        keywords?: string;
    }): Promise<AsinSearchResult[]> => {
        const response = await apiClient.get<AsinSearchResult[]>('/api/asin-search/', {
            params,
        });
        return response.data;
    },
};

// Settings operations
export const settingsApi = {
    get: async (): Promise<Settings> => {
        const response = await apiClient.get<Settings>('/api/settings/');
        return response.data;
    },

    update: async (settings: Settings): Promise<void> => {
        await apiClient.post('/api/settings/', settings);
    },

    verifyPaths: async (): Promise<Record<string, string>> => {
        const response = await apiClient.get<Record<string, string>>('/api/settings/verify/');
        return response.data;
    },

    getVersions: async (): Promise<VersionInfo> => {
        const response = await apiClient.get<VersionInfo>('/api/versions/');
        return response.data;
    },
};

// Authentication
export const authApi = {
    login: async (username: string, password: string): Promise<User> => {
        const response = await apiClient.post<User>('/api/auth/login', {
            username,
            password,
        });
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/api/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await apiClient.get<User>('/api/auth/user');
        return response.data;
    },

    checkSetup: async (): Promise<SetupStatus> => {
        const response = await apiClient.get<SetupStatus>('/api/auth/check-setup');
        return response.data;
    },

    initialSetup: async (username: string, password: string, email?: string): Promise<User> => {
        const response = await apiClient.post<User>('/api/auth/setup', {
            username,
            password,
            email,
        });
        return response.data;
    },
};

// Passkey (WebAuthn) operations
export const passkeyApi = {
    list: async (): Promise<PasskeyCredential[]> => {
        const response = await apiClient.get<PasskeyCredential[]>('/api/auth/passkeys/');
        return response.data;
    },

    registerBegin: async (): Promise<any> => {
        const response = await apiClient.get('/api/auth/passkey/register/begin/');
        return response.data;
    },

    registerComplete: async (credential: any): Promise<void> => {
        await apiClient.post('/api/auth/passkey/register/complete/', credential);
    },

    loginBegin: async (): Promise<any> => {
        const response = await apiClient.get('/api/auth/passkey/login/begin/');
        return response.data;
    },

    loginComplete: async (assertion: any): Promise<User> => {
        const response = await apiClient.post<User>('/api/auth/passkey/login/complete/', assertion);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/auth/passkeys/${id}/`);
    },
};

// User management (admin only)
export const usersApi = {
    getAll: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/api/users/');
        return response.data;
    },

    getById: async (id: number): Promise<User> => {
        const response = await apiClient.get<User>(`/api/users/${id}/`);
        return response.data;
    },

    create: async (userData: { username: string; password: string; email?: string; is_superuser?: boolean }): Promise<User> => {
        const response = await apiClient.post<User>('/api/users/', userData);
        return response.data;
    },

    update: async (id: number, userData: Partial<{ email: string; password: string; is_superuser: boolean }>): Promise<User> => {
        const response = await apiClient.put<User>(`/api/users/${id}/`, userData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/users/${id}/`);
    },
};
