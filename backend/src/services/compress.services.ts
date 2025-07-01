import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';
import { getCloudReadableStream, uploadToCloud } from '../utils/cloudStream';
import HttpException from '../exceptions/HttpException';

class CompressService {

  public async handleCompression(
    provider: 'gdrive' | 'dropbox',
    fileId: string,
    accessToken: string
  ): Promise<any> {
    try {
      // 1. Fetch input video stream from cloud
      const inputStream = await getCloudReadableStream(provider, fileId, accessToken);
      // 2. Compress using FFmpeg
      const outputStream = new PassThrough();
      const ffmpeg = spawn(ffmpegPath, [
        '-i', 'pipe:0',         // Input from stdin
        '-c:v', 'libx264',      // Video codec
        '-preset', 'veryfast',  // Compression speed
        '-crf', '21',           // Quality (lower = better)
        '-movflags', 'frag_keyframe+empty_moov', // For better streaming
        '-c:a', 'aac',          // Audio codec
        '-f', 'mp4',            // Output format
        'pipe:1'                // Output to stdout
      ]);
      inputStream.pipe(ffmpeg.stdin);
      ffmpeg.stdout.pipe(outputStream);
      // Error handling for FFmpeg
      ffmpeg.stderr.on('data', (data) => {
        console.error('FFmpeg error:', data.toString());
      });
      ffmpeg.on('close', (code) => {
        console.log('FFmpeg process closed with code', code);
        outputStream.end();
      });
      // 3. Upload compressed stream back to cloud
      const uploadResult = await uploadToCloud(provider, outputStream, accessToken);
      return uploadResult;
    } catch (err) {
      throw new HttpException(500, 'Compression pipeline failed: ' + err.message);
    }
  }
}

export default CompressService;
