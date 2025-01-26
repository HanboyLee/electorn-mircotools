declare module 'exifr' {
  const exifr: any;
  export default exifr;
}

declare module 'exiftool-vendored' {
  export class ExifTool {
    [x: string]: any;
    constructor(options?: any);
    write(file: string, tags: Record<string, any>): Promise<void>;
    end(): Promise<void>;
  }
}
