/// <reference types="wicg-file-system-access" />
import { FileSystemHandle } from './FileSystemHandle.js';
import { FileSystemFileHandle } from './FileSystemFileHandle.js';
import { FileSystemFolderHandleAdapter } from './interfaces.js';
export declare class FileSystemDirectoryHandle extends FileSystemHandle implements globalThis.FileSystemDirectoryHandle {
    readonly kind = "directory";
    constructor(adapter: FileSystemFolderHandleAdapter);
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
    /** @deprecated */
    getDirectory(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
    entries(): AsyncGenerator<[string, FileSystemFileHandle | FileSystemDirectoryHandle], void, unknown>;
    /** @deprecated */
    getEntries(): AsyncGenerator<never, AsyncGenerator<[string, FileSystemFileHandle | FileSystemDirectoryHandle], void, unknown>, unknown>;
    keys(): AsyncGenerator<string, void, unknown>;
    values(): AsyncGenerator<FileSystemFileHandle | FileSystemDirectoryHandle, void, unknown>;
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
    /** @deprecated */
    getFile(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
    removeEntry(name: string, options?: FileSystemRemoveOptions): Promise<void>;
    resolve(possibleDescendant: globalThis.FileSystemHandle): Promise<string[] | null>;
    [Symbol.asyncIterator](): AsyncGenerator<[string, FileSystemFileHandle | FileSystemDirectoryHandle], void, unknown>;
}
export default FileSystemDirectoryHandle;
