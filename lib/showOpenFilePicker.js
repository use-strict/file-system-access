const native = globalThis.showOpenFilePicker;
export async function showOpenFilePicker(opts = {}) {
    if (native && !opts._preferPolyfill) {
        return native(opts);
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = !!opts.multiple;
    input.accept = (opts.accepts || [])
        .map(e => [
        ...(e.extensions || []).map(e => '.' + e),
        ...e.mimeTypes || []
    ])
        .flat()
        .join(',');
    // See https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
    input.style.position = 'fixed';
    input.style.top = '-100000px';
    input.style.left = '-100000px';
    document.body.appendChild(input);
    const { makeFileHandlesFromFileList } = await import('./util.js');
    return new Promise((resolve, reject) => {
        input.addEventListener('change', () => {
            makeFileHandlesFromFileList(input.files).then(resolve).catch(reject);
            document.body.removeChild(input);
        });
        input.click();
    });
}
export default showOpenFilePicker;
//# sourceMappingURL=showOpenFilePicker.js.map