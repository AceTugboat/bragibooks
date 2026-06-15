// Core domain types

export interface Book {
    id: number;
    title: string;
    asin: string;
    short_desc: string;
    long_desc: string;
    release_date: string;
    series: string;
    publisher: string;
    lang: string;
    runtime_length_minutes: number;
    format_type: string;
    converted: boolean;
    src_path: string;
    dest_path: string;
    created_at: string;
    updated_at: string;
    status: Status;
    cover_image_link: string;
    authors: Author[];
    narrators: Narrator[];
}

export interface Author {
    id: number;
    first_name: string;
    last_name: string;
    asin: string | null;
    short_desc: string;
    long_desc: string;
}

export interface Narrator {
    id: number;
    first_name: string;
    last_name: string;
    short_desc: string;
    long_desc: string;
}

export const StatusChoice = {
    PROCESSING: 'Processing',
    DONE: 'Done',
    ERROR: 'Error',
} as const;

export type StatusChoiceType = typeof StatusChoice[keyof typeof StatusChoice];

export interface Status {
    id: number;
    status: StatusChoiceType;
    message: string;
}

export interface Settings {
    id?: number;
    api_url: string;
    archive_directory: string;
    input_directory: string;
    num_cpus: number;
    output_directory: string;
    output_scheme: string;
    skip_conversion?: boolean;
    audio_bitrate?: number | null;
    audio_samplerate?: number | null;
    chapter_source?: 'audible' | 'source_file';
    ignore_source_tags?: boolean;
    chapter_name_format?: string;
}

// File explorer types
export interface FileItem {
    path: string;
    name: string;
    is_directory: boolean;
    has_children: boolean;
    children?: FileItem[];
    created_at: number;  // Unix timestamp
    modified_at: number; // Unix timestamp
    size: number;
}

export interface DirectoryContents {
    contents: FileItem[];
}

// ASIN Search types
export interface AsinSearchResult {
    asin: string;
    title: string;
    subtitle?: string;
    authors: string;
    narrators: string;
    publisher: string;
    release_date: string;
    runtime_length_min: number;
    image_link?: string[];
    score: number;
}

// API Response types
export interface ApiError {
    error: string;
    details?: string;
}

export interface VersionInfo {
    bragibooks_version: string;
    django_version: string;
    m4b_merge_version: string;
}
