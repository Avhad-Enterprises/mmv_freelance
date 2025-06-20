import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '../interfaces/auth.interface';
import userModel from '../models/users.model';
import DB from '../database/index.schema';
import { IsEmpty } from 'class-validator';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

  try {
    return next();
    // const cookies = req.cookies;
    // if (cookies && cookies.Authorization) {
    //   const secret = process.env.JWT_SECRET;
    //   const verificationResponse = (await jwt.verify(cookies.Authorization, secret)) as DataStoredInToken;
    //   const userId = verificationResponse.id;
    //   const findUser = userModel.find(user => user.id === userId);
    //   if (findUser) {
    //     req.user = findUser;
    //     next();
    //   } else {
    //     next(new HttpException(401, 'Wrong authentication token'));
    //   }
    // } else {
    //   next(new HttpException(404, 'Authentication token missing'));
    // }

    // if (req.path.includes('/superadmin/') || req.path.includes('/employee/employeelogin')) {
    //   await DB.raw("SET search_path TO public");
    //   return next();
    // }

    // const bearerHeader = req.headers['authorization'];

    // if (bearerHeader) {
    //   const bearer = bearerHeader.split(' ');
    //   console.log(JSON.stringify(bearer));
    //   const bearerToken = bearer[1];
    //   console.log(bearerToken);
    //   if (bearerToken != 'null') {
    //     console.log("in if for null")
    //     const secret = process.env.JWT_SECRET;
    //     const verificationResponse = (await jwt.verify(bearerToken, secret)) as DataStoredInToken;
    //     if (verificationResponse) {
    //       console.log(bearer[2])
    //       if (bearer[2] != null || bearer[2] != undefined) {
    //         console.log(DB.raw("Hii SET search_path TO " + bearer[2]).toString())
    //         await DB.raw("SET search_path TO " + bearer[2]);
    //       }
    //       else {
    //         console.log("in public")
    //         await DB.raw("SET search_path TO public");
    //       }
    //       next();
    //     }
    //     else { next(new HttpException(401, 'UnAuthorized User')); }
    //   } else {
    //     console.log('inelse')
    //     await DB.raw("SET search_path TO " + bearer[2]);
    //     next();
    //   }
    // } else {
    //   next(new HttpException(404, 'Authentication token missing'));
    // }

  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

export default authMiddleware;
