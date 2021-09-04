import { errors, isChunkObject } from '../util.js';
const { INVALID, GONE, SYNTAX, DISALLOWED } = errors;
class Sink {
    constructor(fileHandle, file, writer, keepExistingData) {
        this.fileHandle = fileHandle;
        this.writer = writer;
        this.file = keepExistingData ? file : new File([], file.name, file);
        this.size = keepExistingData ? file.size : 0;
        this.position = 0;
    }
    async write(chunk) {
        try {
            // This ensures an error is thrown if the file has been deleted
            await this.fileHandle.getFile();
        }
        catch (err) {
            throw new DOMException(...GONE);
        }
        let file = this.file;
        if (isChunkObject(chunk)) {
            if (chunk.type === 'write') {
                if (typeof chunk.position === 'number' && chunk.position >= 0) {
                    this.position = chunk.position;
                    if (this.size < chunk.position) {
                        this.file = new File([this.file, new ArrayBuffer(chunk.position - this.size)], this.file.name, this.file);
                    }
                }
                if (!('data' in chunk)) {
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
                    throw new DOMException(...SYNTAX('seek requires a position argument'));
                }
            }
            else if (chunk.type === 'truncate') {
                if (Number.isInteger(chunk.size) && chunk.size >= 0) {
                    file = chunk.size < this.size
                        ? new File([file.slice(0, chunk.size)], file.name, file)
                        : new File([file, new Uint8Array(chunk.size - this.size)], file.name, file);
                    this.size = file.size;
                    if (this.position > file.size) {
                        this.position = file.size;
                    }
                    this.file = file;
                    return;
                }
                else {
                    throw new DOMException(...SYNTAX('truncate requires a size argument'));
                }
            }
        }
        chunk = new Blob([chunk]);
        let blob = this.file;
        // Calc the head and tail fragments
        const head = blob.slice(0, this.position);
        const tail = blob.slice(this.position + chunk.size);
        // Calc the padding
        let padding = this.position - head.size;
        if (padding < 0) {
            padding = 0;
        }
        blob = new File([
            head,
            new Uint8Array(padding),
            chunk,
            tail
        ], blob.name);
        this.size = blob.size;
        this.position += chunk.size;
        this.file = blob;
    }
    async close() {
        try {
            // This ensures an error is thrown if the file has been deleted
            await this.fileHandle.getFile();
        }
        catch (err) {
            throw new DOMException(...GONE);
        }
        // We need to work with a cloned file because writer.truncate() will destroy our original data
        const bufferCopy = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(this.file);
        });
        this.file = new File([bufferCopy], this.file.name, this.file);
        await new Promise((resolve, reject) => {
            this.writer.onwriteend = resolve;
            this.writer.onerror = reject;
            this.writer.truncate(0);
        });
        await new Promise((resolve, reject) => {
            this.writer.onwriteend = resolve;
            this.writer.onerror = reject;
            this.writer.write(this.file);
        });
        this.writer.onwriteend = null;
        this.writer.onerror = null;
        this.file = this.position = this.size = null;
    }
}
export class FileHandle {
    constructor(file, writable = true) {
        this.kind = 'file';
        this.readable = true;
        this.file = file;
        this.writable = writable;
    }
    get name() {
        return this.file.name;
    }
    async isSameEntry(other) {
        return this.file.toURL() === other.file.toURL();
    }
    getFile() {
        return new Promise(this.file.file.bind(this.file));
    }
    async createWritable(opts) {
        if (!this.writable)
            throw new DOMException(...DISALLOWED);
        const file = await this.getFile();
        return new Promise((resolve, reject) => this.file.createWriter(fileWriter => {
            resolve(new Sink(this, file, fileWriter, !!opts.keepExistingData));
        }, reject));
    }
}
export class FolderHandle {
    constructor(dir, writable = true) {
        this.kind = 'directory';
        this.readable = true;
        this.dir = dir;
        this.writable = writable;
        this.name = dir.name;
    }
    async isSameEntry(other) {
        return this.dir.fullPath === other.dir.fullPath;
    }
    async *entries() {
        const reader = this.dir.createReader();
        const entries = await new Promise(reader.readEntries.bind(reader));
        for (const x of entries) {
            yield [
                x.name,
                x.isFile ?
                    new FileHandle(x, this.writable) :
                    new FolderHandle(x, this.writable)
            ];
        }
    }
    getDirectoryHandle(name, opts = {}) {
        return new Promise((resolve, reject) => {
            this.dir.getDirectory(name, opts, dir => {
                resolve(new FolderHandle(dir));
            }, reject);
        });
    }
    getFileHandle(name, opts = {}) {
        return new Promise((resolve, reject) => this.dir.getFile(name, opts, file => resolve(new FileHandle(file)), reject));
    }
    async removeEntry(name, opts) {
        let entry;
        try {
            entry = await this.getDirectoryHandle(name);
        }
        catch (err) {
            if (err.name === 'TypeMismatchError') {
                entry = await this.getFileHandle(name);
            }
            else {
                throw err;
            }
        }
        return new Promise((resolve, reject) => {
            if (entry instanceof FolderHandle) {
                (opts === null || opts === void 0 ? void 0 : opts.recursive)
                    ? entry.dir.removeRecursively(() => resolve(), reject)
                    : entry.dir.remove(() => resolve(), reject);
            }
            else if (entry.file) {
                entry.file.remove(() => resolve(), reject);
            }
        });
    }
}
const adapter = ({ _persistent = 0 }) => new Promise((resolve, reject) => window.webkitRequestFileSystem(_persistent, 0, e => resolve(new FolderHandle(e.root)), reject));
export default adapter;
//# sourceMappingURL=sandbox.js.map