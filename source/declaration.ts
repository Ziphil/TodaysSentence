//


declare module "png-to-jpeg" {

  const pngToJpeg: (options: {quality: number}) => (buffer: Buffer) => Promise<Buffer>;
  export default pngToJpeg;

}