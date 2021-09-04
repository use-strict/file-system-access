const native = globalThis.showSaveFilePicker;
export async function showSaveFilePicker(options = {}) {
    if (native && !options._preferPolyfill) {
        return native(options);
    }
    const { FileSystemFileHandle } = await import('./FileSystemFileHandle.js');
    const { FileHandle } = await import('./adapters/downloader.js');
    return new FileSystemFileHandle(new FileHandle(options.suggestedName));
}
export default showSaveFilePicker;
//# sourceMappingURL=showSaveFilePicker.js.map