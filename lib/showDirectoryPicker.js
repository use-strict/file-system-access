const native = globalThis.showDirectoryPicker;
export async function showDirectoryPicker(options = {}) {
    if (native && !options._preferPolyfill) {
        return native(options);
    }
    const input = document.createElement('input');
    input.type = 'file';
    // @ts-ignore
    input.webkitdirectory = true;
    // Fallback to multiple files input for iOS Safari
    input.multiple = true;
    // See https://stackoverflow.com/questions/47664777/javascript-file-input-onchange-not-working-ios-safari-only
    input.style.position = 'fixed';
    input.style.top = '-100000px';
    input.style.left = '-100000px';
    document.body.appendChild(input);
    const { makeDirHandleFromFileList } = await import('./util.js');
    return new Promise((resolve, reject) => {
        input.addEventListener('change', () => {
            makeDirHandleFromFileList(input.files).then(resolve).catch(reject);
            document.body.removeChild(input);
        });
        input.click();
    });
}
export default showDirectoryPicker;
//# sourceMappingURL=showDirectoryPicker.js.map