import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedUser {
    id: number;
    email: string;
}

interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

export default class GoogleAuthController {
    public handleGoogleCallback = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user = req.user;

            if (!user) {
                res.status(401).json({
                    message: "User not found after authentication",
                });
                return;
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET as string,
                { expiresIn: "1h" }
            );

            res.status(200).json({
                message: "Login successful",
                token,
                user,
            });
        } catch (error) {
            next(error);
        }
    };
}
