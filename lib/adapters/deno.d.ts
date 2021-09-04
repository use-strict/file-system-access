export class Sink {
    /**
     * @param {Deno.File} fileHandle
     * @param {string} path
     * @param {number} size
     */
    constructor(fileHandle: any, path: string, size: number);
    fileHandle: any;
    path: string;
    size: number;
    position: number;
    abort(): Promise<void>;
    write(chunk: any): Promise<void>;
    close(): Promise<void>;
}
export class FileHandle {
    /**
     * @param {string} path
     * @param {string} name
     */
    constructor(path: string, name: string);
    name: string;
    /** @readonly */
    readonly kind: "file";
    writable: boolean;
    getFile(): Promise<File>;
    isSameEntry(other: any): Promise<boolean>;
    createWritable(): Promise<Sink>;
    #private;
}
export class FolderHandle {
    /** @param {string} path */
    constructor(path: string, name?: string);
    name: string;
    /** @readonly */
    readonly kind: "directory";
    writable: boolean;
    isSameEntry(other: any): Promise<boolean>;
    /**
     * @returns {AsyncGenerator<[string, FileHandle | FolderHandle], void, unknown>}
     */
    entries(): AsyncGenerator<[string, FileHandle | FolderHandle], void, unknown>;
    /**
     * @param {string} name
     * @param {{create?: boolean}} opts
     */
    getDirectoryHandle(name: string, opts?: {
        create?: boolean;
    }): Promise<FolderHandle>;
    /**
     * @param {string} name
     * @param {{ create: any; }} opts
     */
    getFileHandle(name: string, opts: {
        create: any;
    }): Promise<FileHandle>;
    /**
     * @returns {Promise<PermissionState>}
     */
    queryPermission(): Promise<PermissionState>;
    /**
     * @param {string} name
     * @param {{ recursive: boolean; }} opts
     */
    removeEntry(name: string, opts: {
        recursive: boolean;
    }): Promise<void>;
    #private;
}
declare var _default: (path: string) => import("../interfaces.js").FileSystemFolderHandleAdapter | Promise<import("../interfaces.js").FileSystemFolderHandleAdapter>;
export default _default;
