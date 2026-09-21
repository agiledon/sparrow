export interface ImageSize {
  width: number;
  height: number;
}

export function readImageSize(buf: Buffer): ImageSize | undefined {
  if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        break;
      }
      const marker = buf[offset + 1]!;
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      const size = buf.readUInt16BE(offset + 2);
      offset += 2 + size;
    }
  }
  if (buf.length >= 10 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return {
      width: buf.readUInt16LE(6),
      height: buf.readUInt16LE(8),
    };
  }
  return undefined;
}

export function extForMime(mime: string): string {
  if (mime.includes('jpeg') || mime.includes('jpg')) {
    return 'jpg';
  }
  if (mime.includes('gif')) {
    return 'gif';
  }
  if (mime.includes('webp')) {
    return 'webp';
  }
  return 'png';
}

export function mimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  return 'image/png';
}
