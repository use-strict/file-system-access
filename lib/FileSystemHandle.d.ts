/// <reference types="wicg-file-system-access" />
import { FileSystemHandleAdapter } from './interfaces';
export declare class FileSystemHandle {
    readonly kind: 'file' | 'directory';
    readonly name: string;
    /** @deprecated */
    get isFile(): any;
    /** @deprecated */
    get isDirectory(): any;
    constructor(adapter: FileSystemHandleAdapter);
    queryPermission(options?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(options?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    isSameEntry(other: FileSystemHandle | globalThis.FileSystemHandle): Promise<boolean>;
}
export default FileSystemHandle;
