import type { WriteChunk } from './interfaces';
declare const ws: {
    new <W = any>(underlyingSink?: UnderlyingSink<W> | undefined, strategy?: QueuingStrategy<W> | undefined): WritableStream<W>;
    prototype: WritableStream<any>;
};
export declare class FileSystemWritableFileStream extends ws<WriteChunk> {
    constructor(underlyingSink?: UnderlyingSink, strategy?: QueuingStrategy);
    close(): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
    write(data: WriteChunk): Promise<void>;
}
export default FileSystemWritableFileStream;
