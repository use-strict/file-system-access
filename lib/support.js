var _a, _b;
export const support = {
    adapter: {
        cache: !!(globalThis.CacheStorage && globalThis.caches instanceof CacheStorage),
        native: typeof ((_b = (_a = globalThis.navigator) === null || _a === void 0 ? void 0 : _a.storage) === null || _b === void 0 ? void 0 : _b.getDirectory) === 'function',
        sandbox: typeof window !== 'undefined' && typeof window.webkitRequestFileSystem === 'function'
    }
};
//# sourceMappingURL=support.js.map