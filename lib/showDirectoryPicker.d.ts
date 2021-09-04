/// <reference types="wicg-file-system-access" />
export interface CustomDirectoryPickerOptions extends DirectoryPickerOptions {
    /** If you rather want to use the polyfill instead of the native implementation */
    _preferPolyfill?: boolean;
}
export declare function showDirectoryPicker(options?: CustomDirectoryPickerOptions): Promise<globalThis.FileSystemDirectoryHandle>;
export default showDirectoryPicker;
