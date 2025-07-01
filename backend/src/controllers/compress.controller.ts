import CompressService from "../services/compress.services";
import { NextFunction, Request, Response } from "express";
import { CompressVideoDto } from "../dtos/compress_video.dto";
import { ICompressVideo } from "../interfaces/compress_video.interface";
import HttpException from "../exceptions/HttpException";

class compressController{
  public CompressService = new CompressService();

  public compressVideo = async(
    req:Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {

    const { provider, fileId, accessToken } = req.body;

    if (!provider || !fileId || !accessToken) {
      res.status(400).json({ error: 'Missing provider, fileId, or accessToken' });
      return;
    }
  
    try {
      const result = await this.CompressService.handleCompression(provider, fileId, accessToken);
      res.json({ status: 'success', result });
    } catch (err) {
      console.error('Compression error:', err);
      res.status(500).json({ error: err.message || 'Compression failed' });
    }
  }

}
export default compressController;

// const inputStream = await getCloudReadableStream('gdrive', fileId, accessToken);
// const compressedStream = compressStream(inputStream);
// const uploadResult = await uploadToCloud('gdrive', compressedStream, accessToken);
