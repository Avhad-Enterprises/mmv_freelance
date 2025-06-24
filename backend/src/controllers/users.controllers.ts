import { NextFunction, Request, Response } from "express";
import { UserDto } from "../dtos/users.dto";
import { User } from "../interfaces/users.interface";
import usersService from "../services/user.services";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";

class usersController {
  public usersService = new usersService();

  public insertusers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: UserDto = req.body;
      const locationData: User = await this.usersService.Insert(
        userData
      );
      res.status(201).json({ data: locationData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  public loginusers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new HttpException(400, "Please provide both email and password");
      }

      const user = await this.usersService.Login(email, password);

      // Exclude password from response
      const { password: _pw, ...userData } = user as any;

      const token = generateToken(userData);

      res.status(200).json({
        data: { user: userData, token },
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  };

  public updateuserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const raw = (req.body as any).users_id;
      console.log(raw);
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  
      if (isNaN(idNum)) {
        res.status(400).json({ error: 'users_id must be a number' });
        return;
      }
  
      // Clone body and exclude code_id
      const { users_id, ...fieldsToUpdate } = req.body;
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }
  
      const updated = await this.usersService.update(idNum, fieldsToUpdate);
      res.status(200).json({ data: updated, message: 'users updated'});
    } catch (error) {
      next(error);
    }
  };
  
}

export default usersController;
