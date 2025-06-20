import { EmployeeDto } from "../dtos/employee.dto";
import DB, { T } from "../database/index.schema";
import { IEmployee } from "../interfaces/employee.interface";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";

class EmployeeService {
  public async Insert(data: EmployeeDto): Promise<IEmployee> {
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");
    const existingEmployee = await DB(T.EMPLOYEE_TABLE)
      .where("email", data.email)
      .first();
    if (existingEmployee) {
      throw new HttpException(400, "Email already registered");
    }
    var res = await DB(T.EMPLOYEE_TABLE).insert(data).returning("*");
    return res[0];
  }
}

export default EmployeeService;
