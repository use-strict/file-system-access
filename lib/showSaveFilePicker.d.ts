/// <reference types="wicg-file-system-access" />
export interface CustomSaveFilePickerOptions extends SaveFilePickerOptions {
    /** If you rather want to use the polyfill instead of the native implementation */
    _preferPolyfill?: boolean;
    /** The name to fall back to when using polyfill */
    suggestedName?: string;
}
export declare function showSaveFilePicker(options?: CustomSaveFilePickerOptions): Promise<globalThis.FileSystemFileHandle>;
export default showSaveFilePicker;
