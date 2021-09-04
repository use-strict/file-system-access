/// <reference types="wicg-file-system-access" />
import { Adapter, FileSystemFileHandleAdapter, FileSystemFolderHandleAdapter, WriteChunk } from '../interfaces.js';
declare class Sink implements UnderlyingSink<WriteChunk> {
    private fileHandle;
    private file;
    private size;
    private position;
    constructor(fileHandle: FileHandle, keepExistingData: boolean);
    write(chunk: WriteChunk): Promise<void>;
    close(): Promise<void>;
}
export declare class FileHandle implements FileSystemFileHandleAdapter {
    file: File | null;
    readonly name: string;
    readonly kind = "file";
    private deleted;
    writable: boolean;
    onclose?(self: this): void;
    constructor(name?: string, file?: File, writable?: boolean);
    getFile(): Promise<File>;
    createWritable(opts?: FileSystemCreateWritableOptions): Promise<Sink>;
    isSameEntry(other: FileHandle): Promise<boolean>;
    destroy(): void;
}
export declare class FolderHandle implements FileSystemFolderHandleAdapter {
    readonly name: string;
    readonly kind = "directory";
    private deleted;
    _entries: Record<string, FolderHandle | FileHandle>;
    writable: boolean;
    constructor(name: string, writable?: boolean);
    entries(): AsyncGenerator<[string, FileHandle | FolderHandle], void, undefined>;
    isSameEntry(other: FolderHandle): Promise<boolean>;
    getDirectoryHandle(name: string, opts?: {
        create?: boolean;
    }): Promise<FolderHandle>;
    getFileHandle(name: string, opts?: {
        create?: boolean;
    }): Promise<FileHandle>;
    removeEntry(name: string, opts?: {
        recursive?: boolean;
    }): Promise<void>;
    destroy(recursive?: boolean): void;
}
declare const adapter: Adapter<void>;
export default adapter;
