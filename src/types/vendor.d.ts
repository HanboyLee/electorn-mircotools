declare module 'exifr' {
  const exifr: any;
  export default exifr;
}

declare module 'exiftool-vendored' {
  export class ExifTool {
    [x: string]: any;
    constructor(options?: any);
    write(
      file: string,
      tags: Record<string, any>,
      writeArgsOrOptions?: string[] | Record<string, any>,
      options?: Record<string, any>
    ): Promise<void>;
    read(file: string, argsOrOptions?: any, options?: any): Promise<any>;
    end(): Promise<void>;
  }
}
