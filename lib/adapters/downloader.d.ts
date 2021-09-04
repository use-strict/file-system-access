/// <reference types="wicg-file-system-access" />
import { FileSystemFileHandleAdapter, WriteChunk } from '../interfaces.js';
export declare class FileHandle implements FileSystemFileHandleAdapter {
    readonly name: string;
    readonly kind = "file";
    writable: boolean;
    constructor(name?: string);
    getFile(): Promise<never>;
    createWritable(options?: FileSystemCreateWritableOptions & {
        size?: number;
    }): Promise<WritableStreamDefaultWriter<WriteChunk>>;
    isSameEntry(other: FileHandle): Promise<boolean>;
}
