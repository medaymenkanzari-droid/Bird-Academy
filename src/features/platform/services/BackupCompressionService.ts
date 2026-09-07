import { BackupBinaryCodec } from './BackupBinaryCodec';

export interface CompressedBackupEnvelope {
  format: 'bird-academy-compressed-backup';
  version: 1;
  compression: {
    algorithm: 'gzip';
    originalSize: number;
    data: string;
  };
}

export class BackupCompressionService {
  static isCompressedEnvelope(value: unknown): value is CompressedBackupEnvelope {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<CompressedBackupEnvelope>;
    return candidate.format === 'bird-academy-compressed-backup'
      && candidate.version === 1
      && candidate.compression?.algorithm === 'gzip'
      && typeof candidate.compression.originalSize === 'number'
      && typeof candidate.compression.data === 'string';
  }

  static async compress(plaintext: string): Promise<string> {
    if (typeof CompressionStream === 'undefined') {
      throw new Error('La compression gzip n’est pas disponible sur cet appareil.');
    }
    const input = new TextEncoder().encode(plaintext);
    const stream = new Blob([input]).stream().pipeThrough(new CompressionStream('gzip'));
    const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
    const envelope: CompressedBackupEnvelope = {
      format: 'bird-academy-compressed-backup',
      version: 1,
      compression: {
        algorithm: 'gzip',
        originalSize: input.byteLength,
        data: BackupBinaryCodec.bytesToBase64(compressed),
      },
    };
    return JSON.stringify(envelope);
  }

  static async decompress(envelope: CompressedBackupEnvelope): Promise<string> {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('La décompression gzip n’est pas disponible sur cet appareil.');
    }
    try {
      const compressed = BackupBinaryCodec.base64ToBytes(envelope.compression.data);
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
      const output = await new Response(stream).arrayBuffer();
      const plaintext = new TextDecoder().decode(output);
      const decodedSize = new TextEncoder().encode(plaintext).byteLength;
      if (decodedSize !== envelope.compression.originalSize) {
        throw new Error('Taille décompressée incohérente.');
      }
      return plaintext;
    } catch {
      throw new Error('Sauvegarde compressée endommagée ou invalide.');
    }
  }
}
