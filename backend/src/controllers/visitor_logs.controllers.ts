import { Request, Response } from 'express';
import visitorservice from '../services/visitors_logs.services';
import { VisitorLogDto } from '../dtos/visitor_logs.dto';
import HttpException from "../exceptions/HttpException";

 class VisitorController {
  private visitorservice = new visitorservice();

  public logvisitor = async (req: Request, res: Response) => {
    try {
      const data = (req.body);
      const result = await this.visitorservice.logVisitor(data);
      res.status(201).json({data: result, message: 'Visitor log saved' });
    } catch (err: any) {
      res.status(400).json({ details: err.message });
    }
  };

  
  public getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.visitorservice.getVisitorStats();
      res.status(200).json({ message: 'Visitor stats retrieved', data: stats });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
    }
  };
  

}


export default VisitorController;
