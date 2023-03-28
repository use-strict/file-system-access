/* global indexedDB, Blob, File, DOMException */
import { errors, isChunkObject } from '../util.js';
const { INVALID, GONE, MISMATCH, MOD_ERR, SYNTAX, ABORT } = errors;
class Sink {
    constructor(db, id, size, file) {
        this.position = 0;
        this.db = db;
        this.id = id;
        this.size = size;
        this.file = file;
    }
    async write(chunk) {
        // Ensure file still exists before writing
        await new Promise((resolve, reject) => {
            const [tx, table] = store(this.db);
            table.get(this.id).onsuccess = (evt) => {
                evt.target.result
                    ? table.get(this.id)
                    : reject(new DOMException(...GONE));
            };
            tx.oncomplete = () => resolve();
            setupTxErrorHandler(tx, reject);
        });
        if (isChunkObject(chunk)) {
            if (chunk.type === 'write') {
                if (typeof chunk.position === 'number' && chunk.position >= 0) {
                    if (this.size < chunk.position) {
                        this.file = new File([this.file, new ArrayBuffer(chunk.position - this.size)], this.file.name, this.file);
                    }
                    this.position = chunk.position;
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
                    let file = this.file;
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
    close() {
        return new Promise((resolve, reject) => {
            const [tx, table] = store(this.db);
            table.get(this.id).onsuccess = (evt) => {
                evt.target.result
                    ? table.put(this.file, this.id)
                    : reject(new DOMException(...GONE));
            };
            tx.oncomplete = () => resolve();
            setupTxErrorHandler(tx, reject);
        });
    }
}
class FileHandle {
    constructor(db, id, name) {
        this.kind = 'file';
        this.writable = true;
        this.readable = true;
        this._db = db;
        this._id = id;
        this.name = name;
    }
    async isSameEntry(other) {
        return this._id === other._id;
    }
    async getFile() {
        const file = await new Promise((resolve, reject) => {
            const [tx, table] = store(this._db);
            setupTxErrorHandler(tx, reject);
            const req = table.get(this._id);
            req.onsuccess = evt => {
                tx.oncomplete = () => resolve(evt.target.result);
            };
            req.onerror = evt => reject(evt.target.error);
        });
        if (!file)
            throw new DOMException(...GONE);
        return file;
    }
    async createWritable(opts) {
        let file = await this.getFile();
        if (!opts.keepExistingData) {
            file = new File([], file.name, file);
        }
        return new Sink(this._db, this._id, file.size, file);
    }
}
function store(db) {
    // @ts-ignore
    const tx = db.transaction('entries', 'readwrite', { durability: 'relaxed' });
    return [tx, tx.objectStore('entries')];
}
function setupTxErrorHandler(tx, onerror) {
    tx.onerror = (e) => {
        var _a;
        onerror(((_a = e.target.transaction) === null || _a === void 0 ? void 0 : _a.error) || e.target.error);
    };
    tx.onabort = (e) => {
        onerror(e.target.error || new DOMException(...ABORT));
    };
}
function rimraf(store, onNonEmptyDir, result, toDelete, recursive = true) {
    for (const [id, isFile] of Object.values(toDelete || result)) {
        if (isFile)
            store.delete(id);
        else if (recursive) {
            store.get(id).onsuccess = (evt) => rimraf(store, onNonEmptyDir, evt.target.result);
            store.delete(id);
        }
        else {
            store.get(id).onsuccess = (evt) => {
                if (Object.keys(evt.target.result).length !== 0) {
                    onNonEmptyDir();
                }
                else {
                    store.delete(id);
                }
            };
        }
    }
}
class FolderHandle {
    constructor(db, id, name) {
        this.kind = 'directory';
        this.writable = true;
        this.readable = true;
        this._db = db;
        this._id = id;
        this.name = name;
    }
    async *entries() {
        const entries = await new Promise((resolve, reject) => {
            const [tx, table] = store(this._db);
            setupTxErrorHandler(tx, reject);
            const getReq = table.get(this._id);
            getReq.onsuccess = evt => {
                tx.oncomplete = () => resolve(evt.target.result);
            };
            getReq.onerror = evt => reject(evt.target.error);
        });
        if (!entries)
            throw new DOMException(...GONE);
        for (const [name, [id, isFile]] of Object.entries(entries)) {
            yield [name, isFile
                    ? new FileHandle(this._db, id, name)
                    : new FolderHandle(this._db, id, name)
            ];
        }
    }
    async isSameEntry(other) {
        return this._id === other._id;
    }
    getDirectoryHandle(name, opts = {}) {
        return new Promise((resolve, reject) => {
            const [tx, table] = store(this._db);
            setupTxErrorHandler(tx, reject);
            const req = table.get(this._id);
            req.onsuccess = () => {
                const entries = req.result;
                if (!entries)
                    return reject(new DOMException(...GONE));
                const entry = entries[name];
                if (entry) {
                    if (entry[1]) { // isFile?
                        reject(new DOMException(...MISMATCH));
                    }
                    else {
                        tx.oncomplete = () => resolve(new FolderHandle(this._db, entry[0], name));
                    }
                }
                else {
                    if (opts.create) {
                        const addReq = table.add({});
                        addReq.onsuccess = evt => {
                            const id = evt.target.result;
                            entries[name] = [id, false];
                            const putReq = table.put(entries, this._id);
                            putReq.onsuccess = () => {
                                tx.oncomplete = () => resolve(new FolderHandle(this._db, id, name));
                            };
                            putReq.onerror = evt => reject(evt.target.error);
                        };
                        addReq.onerror = evt => reject(evt.target.error);
                    }
                    else {
                        reject(new DOMException(...GONE));
                    }
                }
            };
            req.onerror = evt => {
                reject(evt.target.error);
            };
        });
    }
    getFileHandle(name, opts = {}) {
        return new Promise((resolve, reject) => {
            const [tx, table] = store(this._db);
            setupTxErrorHandler(tx, reject);
            const query = table.get(this._id);
            query.onsuccess = () => {
                const entries = query.result;
                if (!entries)
                    return reject(new DOMException(...GONE));
                const entry = entries[name];
                if (entry && entry[1])
                    tx.oncomplete = () => resolve(new FileHandle(this._db, entry[0], name));
                if (entry && !entry[1])
                    reject(new DOMException(...MISMATCH));
                if (!entry && !opts.create)
                    reject(new DOMException(...GONE));
                if (!entry && opts.create) {
                    try {
                        const q = table.put(new File([], name));
                        q.onsuccess = () => {
                            const id = q.result;
                            entries[name] = [id, true];
                            const query = table.put(entries, this._id);
                            query.onsuccess = () => {
                                tx.oncomplete = () => resolve(new FileHandle(this._db, id, name));
                            };
                            query.onerror = evt => reject(evt.target.error);
                        };
                        q.onerror = evt => reject(evt.target.error);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            };
            query.onerror = evt => reject(evt.target.error);
        });
    }
    async removeEntry(name, opts) {
        return new Promise((resolve, reject) => {
            let nonEmptyDirFound = false;
            const [tx, table] = store(this._db);
            const cwdQ = table.get(this._id);
            cwdQ.onsuccess = (evt) => {
                const cwd = cwdQ.result;
                if (!cwd)
                    throw new DOMException(...GONE);
                const toDelete = { _: cwd[name] };
                if (!toDelete._) {
                    return reject(new DOMException(...GONE));
                }
                delete cwd[name];
                table.put(cwd, this._id);
                rimraf(evt.target.source, () => {
                    nonEmptyDirFound = true;
                    evt.target.transaction.abort();
                }, evt.target.result, toDelete, !!opts.recursive);
            };
            tx.oncomplete = () => resolve();
            setupTxErrorHandler(tx, e => reject(nonEmptyDirFound ? new DOMException(...MOD_ERR) : e));
        });
    }
}
const adapter = () => new Promise((resolve, reject) => {
    const request = indexedDB.open('fileSystem');
    request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore('entries', { autoIncrement: true }).transaction.oncomplete = evt => {
            db.transaction('entries', 'readwrite').objectStore('entries').add({});
        };
    };
    request.onsuccess = () => {
        resolve(new FolderHandle(request.result, 1, ''));
    };
    request.onerror = (ev) => {
        reject(ev.target.error);
    };
});
export default adapter;
//# sourceMappingURL=indexeddb.js.map