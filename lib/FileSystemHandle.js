const kAdapter = Symbol('adapter');
export class FileSystemHandle {
    constructor(adapter) {
        this.kind = adapter.kind;
        this.name = adapter.name;
        this[kAdapter] = adapter;
    }
    /** @deprecated */
    get isFile() {
        return this.kind === 'file';
    }
    /** @deprecated */
    get isDirectory() {
        return this.kind === 'directory';
    }
    async queryPermission(options = { mode: 'read' }) {
        const handle = this[kAdapter];
        if (handle.queryPermission) {
            return handle.queryPermission(options);
        }
        if (options.mode === 'read') {
            return 'granted';
        }
        else if (options.mode === 'readwrite') {
            return handle.writable ? 'granted' : 'denied';
        }
        else {
            throw new TypeError(`Mode ${options.mode} must be 'read' or 'readwrite'`);
        }
    }
    async requestPermission(options = { mode: 'read' }) {
        const handle = this[kAdapter];
        if (handle.requestPermission) {
            return handle.requestPermission(options);
        }
        if (options.mode === 'read') {
            return 'granted';
        }
        else if (options.mode === 'readwrite') {
            return handle.writable ? 'granted' : 'denied';
        }
        else {
            throw new TypeError(`Mode ${options.mode} must be 'read' or 'readwrite'`);
        }
    }
    async isSameEntry(other) {
        if (this === other)
            return true;
        if (this.kind !== other.kind)
            return false;
        if (!other[kAdapter])
            return false;
        return await this[kAdapter].isSameEntry(other[kAdapter]);
    }
}
Object.defineProperty(FileSystemHandle.prototype, Symbol.toStringTag, {
    value: 'FileSystemHandle',
    writable: false,
    enumerable: false,
    configurable: true
});
export default FileSystemHandle;
//# sourceMappingURL=FileSystemHandle.js.map