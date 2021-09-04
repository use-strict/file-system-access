/// <reference types="wicg-file-system-access" />
import { Adapter, FileSystemFileHandleAdapter, FileSystemFolderHandleAdapter, WriteChunk } from '../interfaces.js';
declare class Sink implements UnderlyingSink<WriteChunk> {
    private _cache;
    private path;
    private size;
    private position;
    private file;
    constructor(cache: Cache, path: string, file: File);
    write(chunk: WriteChunk): Promise<void>;
    close(): Promise<void>;
}
export declare class FileHandle implements FileSystemFileHandleAdapter {
    readonly kind = "file";
    private _cache;
    private path;
    writable: boolean;
    readable: boolean;
    constructor(path: string, cache: Cache);
    get name(): string;
    isSameEntry(other: FileHandle): Promise<boolean>;
    getFile(): Promise<File>;
    createWritable(opts: FileSystemCreateWritableOptions): Promise<Sink>;
}
export declare class FolderHandle implements FileSystemFolderHandleAdapter {
    readonly kind = "directory";
    readonly name: string;
    private _dir;
    private _cache;
    writable: boolean;
    readable: boolean;
    constructor(dir: string, cache: Cache);
    entries(): AsyncGenerator<[string, FileHandle | FolderHandle], void, unknown>;
    isSameEntry(other: FolderHandle): Promise<boolean>;
    getDirectoryHandle(name: string, opts?: FileSystemGetDirectoryOptions): Promise<FolderHandle>;
    get _tree(): Promise<Record<string, boolean>>;
    _save(tree: Record<string, boolean>): Promise<void>;
    getFileHandle(name: string, opts?: FileSystemGetFileOptions): Promise<FileHandle>;
    removeEntry(name: string, opts: FileSystemRemoveOptions): Promise<void>;
}
declare const adapter: Adapter<void>;
export default adapter;
