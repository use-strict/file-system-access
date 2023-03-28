import { WriteChunkObject } from './interfaces.js';
declare global {
    interface File {
        webkitRelativePath?: string | undefined;
    }
}
export declare const errors: {
    INVALID: string[];
    GONE: string[];
    MISMATCH: string[];
    MOD_ERR: string[];
    SYNTAX: (m: string) => string[];
    ABORT: string[];
    SECURITY: string[];
    DISALLOWED: string[];
};
export declare const isChunkObject: (chunk: any) => chunk is WriteChunkObject;
export declare function makeDirHandleFromFileList(fileList: FileList): Promise<import("./FileSystemDirectoryHandle.js").FileSystemDirectoryHandle>;
export declare function makeFileHandlesFromFileList(fileList: FileList): Promise<import("./FileSystemFileHandle.js").FileSystemFileHandle[]>;
