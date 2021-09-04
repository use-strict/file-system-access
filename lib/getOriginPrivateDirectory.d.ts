/// <reference types="wicg-file-system-access" />
import { Adapter, AdapterModule } from './interfaces.js';
export declare function getOriginPrivateDirectory(): Promise<globalThis.FileSystemDirectoryHandle>;
export declare function getOriginPrivateDirectory(adapter: Adapter<void> | AdapterModule<void> | Promise<Adapter<void> | AdapterModule<void>>): Promise<globalThis.FileSystemDirectoryHandle>;
export declare function getOriginPrivateDirectory<T>(adapter: Adapter<T> | AdapterModule<T> | Promise<Adapter<T> | AdapterModule<T>>, options: T): Promise<globalThis.FileSystemDirectoryHandle>;
export default getOriginPrivateDirectory;
