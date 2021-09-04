var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FileHandle_instances, _FileHandle_path, _FileHandle_getPath, _FolderHandle_instances, _FolderHandle_path, _FolderHandle_getPath;
import { join, basename } from 'https://deno.land/std@0.98.0/path/mod.ts';
import { errors } from '../util.js';
const { INVALID, GONE, MISMATCH, MOD_ERR, SYNTAX } = errors;
// TODO:
// - either depend on fetch-blob.
// - push for https://github.com/denoland/deno/pull/10969
// - or extend the File class like i did in that PR
/** @param {string} path */
async function fileFrom(path) {
    const e = Deno.readFileSync(path);
    const s = await Deno.stat(path);
    return new File([e], basename(path), { lastModified: Number(s.mtime) });
}
export class Sink {
    /**
     * @param {Deno.File} fileHandle
     * @param {string} path
     * @param {number} size
     */
    constructor(fileHandle, path, size) {
        this.fileHandle = fileHandle;
        this.path = path;
        this.size = size;
        this.position = 0;
    }
    async abort() {
        this.fileHandle.close();
    }
    async write(chunk) {
        try {
            await Deno.stat(this.path);
        }
        catch (err) {
            if (err.name === 'NotFound') {
                this.fileHandle.close();
                throw new DOMException(...GONE);
            }
        }
        if (typeof chunk === 'object') {
            if (chunk.type === 'write') {
                if (Number.isInteger(chunk.position) && chunk.position >= 0) {
                    this.position = chunk.position;
                }
                if (!('data' in chunk)) {
                    this.fileHandle.close();
                    throw new DOMException(...SYNTAX('write requires a data argument'));
                }
                chunk = chunk.data;
            }
            else if (chunk.type === 'seek') {
                if (Number.isInteger(chunk.position) && chunk.position >= 0) {
                    if (this.size < chunk.position) {
                        throw new DOMException(...INVALID);
                    }
                    this.position = chunk.position;
                    return;
                }
                else {
                    this.fileHandle.close();
                    throw new DOMException(...SYNTAX('seek requires a position argument'));
                }
            }
            else if (chunk.type === 'truncate') {
                if (Number.isInteger(chunk.size) && chunk.size >= 0) {
                    await this.fileHandle.truncate(chunk.size);
                    this.size = chunk.size;
                    if (this.position > this.size) {
                        this.position = this.size;
                    }
                    return;
                }
                else {
                    this.fileHandle.close();
                    throw new DOMException(...SYNTAX('truncate requires a size argument'));
                }
            }
        }
        if (chunk instanceof ArrayBuffer) {
            chunk = new Uint8Array(chunk);
        }
        else if (typeof chunk === 'string') {
            chunk = new TextEncoder().encode(chunk);
        }
        else if (chunk instanceof Blob) {
            await this.fileHandle.seek(this.position, Deno.SeekMode.Start);
            for await (const data of chunk.stream()) {
                const written = await this.fileHandle.write(data);
                this.position += written;
                this.size += written;
            }
            return;
        }
        await this.fileHandle.seek(this.position, Deno.SeekMode.Start);
        const written = await this.fileHandle.write(chunk);
        this.position += written;
        this.size += written;
    }
    async close() {
        // First make sure the handle is closed
        this.fileHandle.close();
        try {
            await Deno.stat(this.path);
        }
        catch (err) {
            if (err.name === 'NotFound') {
                throw new DOMException(...GONE);
            }
        }
    }
}
export class FileHandle {
    /**
     * @param {string} path
     * @param {string} name
     */
    constructor(path, name) {
        _FileHandle_instances.add(this);
        _FileHandle_path.set(this, void 0);
        /** @readonly */
        this.kind = 'file';
        this.writable = true;
        __classPrivateFieldSet(this, _FileHandle_path, path, "f");
        this.name = name;
    }
    async getFile() {
        await Deno.stat(__classPrivateFieldGet(this, _FileHandle_path, "f")).catch(err => {
            if (err.name === 'NotFound')
                throw new DOMException(...GONE);
        });
        return fileFrom(__classPrivateFieldGet(this, _FileHandle_path, "f"));
    }
    async isSameEntry(other) {
        return __classPrivateFieldGet(this, _FileHandle_path, "f") === __classPrivateFieldGet(this, _FileHandle_instances, "m", _FileHandle_getPath).apply(other);
    }
    async createWritable() {
        const fileHandle = await Deno.open(__classPrivateFieldGet(this, _FileHandle_path, "f"), { write: true }).catch(err => {
            if (err.name === 'NotFound')
                throw new DOMException(...GONE);
            throw err;
        });
        const { size } = await fileHandle.stat();
        return new Sink(fileHandle, __classPrivateFieldGet(this, _FileHandle_path, "f"), size);
    }
}
_FileHandle_path = new WeakMap(), _FileHandle_instances = new WeakSet(), _FileHandle_getPath = function _FileHandle_getPath() {
    return __classPrivateFieldGet(this, _FileHandle_path, "f");
};
export class FolderHandle {
    /** @param {string} path */
    constructor(path, name = '') {
        _FolderHandle_instances.add(this);
        _FolderHandle_path.set(this, '');
        /** @readonly */
        this.kind = 'directory';
        this.writable = true;
        this.name = name;
        __classPrivateFieldSet(this, _FolderHandle_path, join(path), "f");
    }
    async isSameEntry(other) {
        return __classPrivateFieldGet(this, _FolderHandle_path, "f") === __classPrivateFieldGet(this, _FolderHandle_instances, "m", _FolderHandle_getPath).apply(other);
    }
    /**
     * @returns {AsyncGenerator<[string, FileHandle | FolderHandle], void, unknown>}
     */
    async *entries() {
        const dir = __classPrivateFieldGet(this, _FolderHandle_path, "f");
        try {
            for await (const dirEntry of Deno.readDir(dir)) {
                const { name } = dirEntry;
                const path = join(dir, name);
                const stat = await Deno.lstat(path);
                if (stat.isFile) {
                    yield [name, new FileHandle(path, name)];
                }
                else if (stat.isDirectory) {
                    yield [name, new FolderHandle(path, name)];
                }
            }
        }
        catch (err) {
            throw err.name === 'NotFound' ? new DOMException(...GONE) : err;
        }
    }
    /**
     * @param {string} name
     * @param {{create?: boolean}} opts
     */
    async getDirectoryHandle(name, opts = {}) {
        const path = join(__classPrivateFieldGet(this, _FolderHandle_path, "f"), name);
        const stat = await Deno.lstat(path).catch(err => {
            if (err.name !== 'NotFound')
                throw err;
        });
        const isDirectory = stat === null || stat === void 0 ? void 0 : stat.isDirectory;
        if (stat && isDirectory)
            return new FolderHandle(path, name);
        if (stat && !isDirectory)
            throw new DOMException(...MISMATCH);
        if (!opts.create)
            throw new DOMException(...GONE);
        await Deno.mkdir(path);
        return new FolderHandle(path, name);
    }
    /**
     * @param {string} name
     * @param {{ create: any; }} opts
     */
    async getFileHandle(name, opts) {
        const path = join(__classPrivateFieldGet(this, _FolderHandle_path, "f"), name);
        const stat = await Deno.lstat(path).catch(err => {
            if (err.name !== 'NotFound')
                throw err;
        });
        const isFile = stat === null || stat === void 0 ? void 0 : stat.isFile;
        if (stat && isFile)
            return new FileHandle(path, name);
        if (stat && !isFile)
            throw new DOMException(...MISMATCH);
        if (!opts.create)
            throw new DOMException(...GONE);
        const c = await Deno.open(path, {
            create: true,
            write: true,
        });
        c.close();
        return new FileHandle(path, name);
    }
    /**
     * @returns {Promise<PermissionState>}
     */
    async queryPermission() {
        return 'granted';
    }
    /**
     * @param {string} name
     * @param {{ recursive: boolean; }} opts
     */
    async removeEntry(name, opts) {
        const path = join(__classPrivateFieldGet(this, _FolderHandle_path, "f"), name);
        const stat = await Deno.lstat(path).catch(err => {
            if (err.name === 'NotFound')
                throw new DOMException(...GONE);
            throw err;
        });
        if (stat.isDirectory) {
            if (opts.recursive) {
                await Deno.remove(path, { recursive: true }).catch(err => {
                    if (err.code === 'ENOTEMPTY')
                        throw new DOMException(...MOD_ERR);
                    throw err;
                });
            }
            else {
                await Deno.remove(path).catch(() => {
                    throw new DOMException(...MOD_ERR);
                });
            }
        }
        else {
            await Deno.remove(path);
        }
    }
}
_FolderHandle_path = new WeakMap(), _FolderHandle_instances = new WeakSet(), _FolderHandle_getPath = function _FolderHandle_getPath() {
    return __classPrivateFieldGet(this, _FolderHandle_path, "f");
};
/** @type import('../interfaces.js').Adapter<string> */
export default path => new FolderHandle(join(Deno.cwd(), path));
//# sourceMappingURL=deno.js.map