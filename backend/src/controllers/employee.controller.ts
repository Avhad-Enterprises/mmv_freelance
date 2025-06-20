
import { NextFunction, Request, Response } from 'express';
import { EmployeeDto } from '../dtos/employee.dto';
import { IEmployee } from '../interfaces/employee.interface';
import EmployeeService from '../services/employee.service';

class EmployeeController {

    public EmployeeService = new EmployeeService();

    public insertEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {

            const userData: EmployeeDto = req.body;
            const locationData: IEmployee = await this.EmployeeService.Insert(userData);
            res.status(201).json({ data: locationData, message: 'Inserted' });
        } catch (error) {
            next(error);
        }
    };

}

export default EmployeeController;
