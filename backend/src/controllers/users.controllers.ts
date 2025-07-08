import { NextFunction, Request, Response } from "express";
import { UserDto } from "../dtos/users.dto";
import { User } from "../interfaces/users.interface";
import usersService from "../services/user.services";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";
import { InviteDTO } from "../dtos/admin_invites.dto";

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
      const raw = (req.body as any).user_id;
      console.log(raw);
      const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;
  
      if (isNaN(idNum)) {
        res.status(400).json({ error: 'user_id must be a number' });
        return;
      }
  
      // Clone body and exclude code_id
      const { user_id, ...fieldsToUpdate } = req.body;
  
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
  
  public forgetpasswordusers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body;
    console.log(email);
    if (!email) res.status(400).json({ error: 'Email is required' });

    try {
      await this.usersService.initiatePasswordReset(email);
      res.json({ message: 'If this email exists, you will receive a reset link.' });
    } catch {
      res.json({ message: 'If this email exists, you will receive a reset link.' });
      return
    }
  }

  public reset_password = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { reset_token, password } = req.body;

    if (!reset_token || !password) {
      res.status(400).json({ error: 'reset_token and password are required' });
      return;
    }

    try {
      await this.usersService.resetpassword(reset_token, password);
      res.json({ message: 'password has been successfully reset.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  public insertInviteEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inviteData: InviteDTO = req.body;
      const result = await this.usersService.createInvite(inviteData);
      res.status(201).json({ message: 'Invite sent successfully', data: result });
    } catch (err) {
      next(err);
    }
  };

 public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      const newUser = await this.usersService.registerUser(userData);
      res.status(201).json({ message: 'token verified successfully', user: newUser });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };


}

export default usersController;
