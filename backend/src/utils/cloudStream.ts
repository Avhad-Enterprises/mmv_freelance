import { google } from 'googleapis';
import fetch from 'node-fetch';
import { Dropbox, files } from 'dropbox';
import { PassThrough } from 'stream';

/**
 * Fetches a readable video stream from Google Drive or Dropbox.
 * @param provider 'gdrive' | 'dropbox'
 * @param fileId File ID (Google Drive) or path (Dropbox)
 * @param accessToken OAuth access token
 * @returns Readable stream of the video file
 * @throws Error if provider is unsupported or API call fails
 */
export const getCloudReadableStream = async (
  provider: 'gdrive' | 'dropbox',
  fileId: string,
  accessToken: string
): Promise<NodeJS.ReadableStream> => {
  if (!provider || !fileId || !accessToken) {
    throw new Error('Missing required parameters for cloud stream');
  }
  if (provider === 'gdrive') {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const drive = google.drive({ version: 'v3', auth });
      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      return res.data; // Readable stream
    } catch (err) {
      throw new Error('Google Drive stream error: ' + err.message);
    }
  }
  if (provider === 'dropbox') {
    try {
      const res = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path: fileId })
        }
      });
      if (!res.ok) throw new Error('Dropbox download failed: ' + res.statusText);
      return res.body as NodeJS.ReadableStream;
    } catch (err) {
      throw new Error('Dropbox stream error: ' + err.message);
    }
  }
  // TODO: Add support for more providers if needed
  throw new Error('Unsupported provider: ' + provider);
};

/**
 * Uploads a video stream to Google Drive or Dropbox.
 * @param provider 'gdrive' | 'dropbox'
 * @param stream Readable stream to upload
 * @param accessToken OAuth access token
 * @param filename Name for the uploaded file (default: 'compressed.mp4')
 * @returns Upload result (file metadata)
 * @throws Error if provider is unsupported or upload fails
 */
export const uploadToCloud = async (
  provider: 'gdrive' | 'dropbox',
  stream: NodeJS.ReadableStream,
  accessToken: string,
  filename = 'compressed.mp4'
): Promise<any> => {
  if (!provider || !stream || !accessToken) {
    throw new Error('Missing required parameters for cloud upload');
  }
  if (provider === 'gdrive') {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const drive = google.drive({ version: 'v3', auth });
      const response = await drive.files.create({
        requestBody: {
          name: filename,
          mimeType: 'video/mp4'
        },
        media: {
          mimeType: 'video/mp4',
          body: stream
        }
      });
      return response.data; // file ID, etc.
    } catch (err) {
      throw new Error('Google Drive upload error: ' + err.message);
    }
  }
  if (provider === 'dropbox') {
    try {
      const bufferStream = new PassThrough();
      stream.pipe(bufferStream);
      const chunks: Buffer[] = [];
      bufferStream.on('data', chunk => chunks.push(chunk));
      return new Promise((resolve, reject) => {
        bufferStream.on('end', async () => {
          try {
            // @ts-ignore: Dropbox type may not be available if not installed
            const dropbox = new Dropbox({ accessToken });
            const result = await dropbox.filesUpload({
              path: `/${filename}`,
              contents: Buffer.concat(chunks),
              mode: { ".tag": "add" } as files.WriteMode,
              autorename: true,
              mute: false
            });
            resolve(result);
          } catch (err) {
            reject(new Error('Dropbox upload error: ' + err.message));
          }
        });
        bufferStream.on('error', err => reject(new Error('Dropbox buffer stream error: ' + err.message)));
      });
    } catch (err) {
      throw new Error('Dropbox upload error: ' + err.message);
    }
  }
  // TODO: Add support for more providers if needed
  throw new Error('Unsupported provider: ' + provider);
};
  