import DB from "../database/index.schema";
import { MacroDto } from '../dtos/macro.dto';
import { NextFunction, Request, Response } from "express";
import MacroService from "../services/macro.service";
import HttpException from "../exceptions/HttpException";

class macroController {

    public MacroService = new MacroService();
    public addmacro = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const macroData: MacroDto = req.body;

            const inserteddata = await this.MacroService.addtomacro(macroData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    }
    public updatemacroby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const macroData: Partial<MacroDto> = req.body;
            const updatemacro = await this.MacroService.updatemacrobyid(macroData);
            res.status(200).json({ data: updatemacro, message: "Macro updated" });
        } catch (error) {
            next(error);
        }
    };
    public deletemacro = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const macrodata = req.body;
            const deletedmacro = await this.MacroService.SoftDeletemacro(macrodata);
            res.status(200).json({ data: deletedmacro, message: "macro deleted" });
        } catch (error) {
            next(error);
        }
    };
    public getallmacroby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const macro = await this.MacroService.getallmacrobytable();
            res.status(200).json({ data: macro, success: true });
        } catch (err) {
            next(err);
        }
    };
    public geteditmacro = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const macro_id = Number(req.params.id);
            const macro = await this.MacroService.geteditmacroby(macro_id);
            res.status(200).json({ data: macro, message: "macro fetched" });
        } catch (error) {
            next();
        }
    };
    public applyMacroToComplaint = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { macro_id, complaint_id } = req.body;

            if (!macro_id || !complaint_id) {
                throw new HttpException(400, 'macro_id and complaint_id are required');
            }

            const finalReply = await this.MacroService.generateReplyFromMacro(macro_id, complaint_id);
            res.status(200).json({ final_reply: finalReply });
        } catch (error) {
            next(error);
        }
    };

}
export default macroController;