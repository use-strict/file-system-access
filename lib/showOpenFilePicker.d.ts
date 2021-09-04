/// <reference types="wicg-file-system-access" />
export interface FallbackAcceptsObject {
    extensions?: string[];
    mimeTypes?: string[];
}
export interface CustomOpenFilePickerOptions extends OpenFilePickerOptions {
    /** If you rather want to use the polyfill instead of the native implementation */
    _preferPolyfill?: boolean;
    /** Accept options for input fallback */
    accepts?: FallbackAcceptsObject[];
}
export declare function showOpenFilePicker(opts?: CustomOpenFilePickerOptions): Promise<globalThis.FileSystemFileHandle[]>;
export default showOpenFilePicker;
