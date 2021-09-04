/// <reference types="filesystem" />
/// <reference types="wicg-file-system-access" />
/// <reference types="filewriter" />
import { Adapter, FileSystemFileHandleAdapter, FileSystemFolderHandleAdapter, WriteChunk } from '../interfaces.js';
declare class Sink implements UnderlyingSink<WriteChunk> {
    private fileHandle;
    private writer;
    private file;
    private size;
    private position;
    constructor(fileHandle: FileHandle, file: File, writer: FileWriter, keepExistingData: boolean);
    write(chunk: WriteChunk): Promise<void>;
    close(): Promise<void>;
}
export declare class FileHandle implements FileSystemFileHandleAdapter {
    readonly kind = "file";
    file: FileEntry;
    writable: boolean;
    readable: boolean;
    constructor(file: FileEntry, writable?: boolean);
    get name(): string;
    isSameEntry(other: FileHandle): Promise<boolean>;
    getFile(): Promise<File>;
    createWritable(opts: FileSystemCreateWritableOptions): Promise<Sink>;
}
export declare class FolderHandle implements FileSystemFolderHandleAdapter {
    readonly kind = "directory";
    readonly name: string;
    private dir;
    writable: boolean;
    readable: boolean;
    constructor(dir: FileSystemDirectoryEntry, writable?: boolean);
    isSameEntry(other: FolderHandle): Promise<boolean>;
    entries(): AsyncGenerator<[string, FileHandle | FolderHandle], void, unknown>;
    getDirectoryHandle(name: string, opts?: Flags): Promise<FolderHandle>;
    getFileHandle(name: string, opts?: Flags): Promise<FileHandle>;
    removeEntry(name: string, opts?: {
        recursive?: boolean;
    }): Promise<void>;
}
export interface SandboxOptions {
    _persistent?: 0 | 1;
}
declare const adapter: Adapter<SandboxOptions>;
export default adapter;
