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
      throw new HttpException(400,"Missing provider, fileId, or accessToken");
    }
  
    try {
      const result = await this.CompressService.handleCompression(provider, fileId, accessToken);
      res.json({ status: 'success', result });
    } 
    catch (err) {
      console.error('Compression error:', err);
      throw new HttpException(500,"Compression Failed")
    }
  }

}
export default compressController;