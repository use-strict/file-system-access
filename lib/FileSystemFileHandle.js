import { FileSystemHandle } from './FileSystemHandle.js';
const kAdapter = Symbol('adapter');
export class FileSystemFileHandle extends FileSystemHandle {
    constructor(adapter) {
        super(adapter);
        this.kind = 'file';
        this[kAdapter] = adapter;
    }
    async createWritable(options = {}) {
        const { FileSystemWritableFileStream } = await import('./FileSystemWritableFileStream.js');
        return new FileSystemWritableFileStream(await this[kAdapter].createWritable(options));
    }
    async getFile() {
        return this[kAdapter].getFile();
    }
}
Object.defineProperty(FileSystemFileHandle.prototype, Symbol.toStringTag, {
    value: 'FileSystemFileHandle',
    writable: false,
    enumerable: false,
    configurable: true
});
Object.defineProperties(FileSystemFileHandle.prototype, {
    createWritable: { enumerable: true },
    getFile: { enumerable: true }
});
export default FileSystemFileHandle;
//# sourceMappingURL=FileSystemFileHandle.js.map