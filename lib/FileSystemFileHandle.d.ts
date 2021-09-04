/// <reference types="wicg-file-system-access" />
import { FileSystemHandle } from './FileSystemHandle.js';
import { FileSystemFileHandleAdapter } from './interfaces.js';
export declare class FileSystemFileHandle extends FileSystemHandle implements globalThis.FileSystemFileHandle {
    readonly kind = "file";
    constructor(adapter: FileSystemFileHandleAdapter);
    createWritable(options?: FileSystemCreateWritableOptions): Promise<import("./FileSystemWritableFileStream.js").FileSystemWritableFileStream>;
    getFile(): Promise<File>;
}
export default FileSystemFileHandle;
