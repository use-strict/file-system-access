import { FileSystemDirectoryHandle } from './FileSystemDirectoryHandle.js';
export async function getOriginPrivateDirectory(adapter, options = {}) {
    var _a, _b, _c, _d;
    if (!adapter) {
        if (!((_a = globalThis.navigator) === null || _a === void 0 ? void 0 : _a.storage) && ((_b = globalThis.location) === null || _b === void 0 ? void 0 : _b.protocol) === 'http:') {
            throw new Error(`Native getDirectory not supported in HTTP context. Please use HTTPS instead or provide an adapter.`);
        }
        if (!((_d = (_c = globalThis.navigator) === null || _c === void 0 ? void 0 : _c.storage) === null || _d === void 0 ? void 0 : _d.getDirectory)) {
            throw new Error(`Native StorageManager.getDirectory() is not supported in current environment. Please provide an adapter instead.`);
        }
        return globalThis.navigator.storage.getDirectory();
    }
    const module = await adapter;
    const sandbox = typeof module === 'function' ? await module(options) : await module.default(options);
    return new FileSystemDirectoryHandle(sandbox);
}
export default getOriginPrivateDirectory;
//# sourceMappingURL=getOriginPrivateDirectory.js.map