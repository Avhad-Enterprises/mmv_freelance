import { MacroDto } from '../dtos/macro.dto';
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { MACRO } from "../database/macro.schema";
import { Macro } from '../interfaces/macro.interface';

class MacroService {

    public async addtomacro(data: MacroDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Macro data is empty");
        }

        const insertedMacro = await DB(T.MACRO)
            .insert(data)
            .returning("*");
        return insertedMacro[0];
    };
    public async updatemacrobyid(data: Partial<MacroDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        if (!data.macro_id) throw new HttpException(400, "macro id is required for update");

        const updated = await DB(T.MACRO)
            .where({ macro_id: data.macro_id })
            .update({ ...data, updated_at: DB.fn.now() })
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Macro not found or not updated");

        return updated[0];

    };
    public async SoftDeletemacro(data: Partial<MacroDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        const deleted = await DB(T.MACRO)
            .where({ macro_id: data.macro_id })
            .update(data)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Macro not found or not delete");

        return deleted[0];
    };
    public async getallmacrobytable(): Promise<any> {
        try {
            const result = await DB(T.MACRO)
                .where({ is_active: 1, is_deleted: false })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching macro');
        }
    };
    public async geteditmacroby(macro_id: number): Promise<any> {
        if (!macro_id) throw new HttpException(400, "Macro ID is required");

        const macro = await DB(T.MACRO).where({ macro_id }).first();
        if (!macro) throw new HttpException(404, "macro not found");

        return macro;
    }
  
}
export default MacroService;
