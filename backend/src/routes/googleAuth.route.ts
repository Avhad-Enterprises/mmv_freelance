import { Router } from "express";
import Route from "../interfaces/route.interface";
import passport from "passport";
import GoogleAuthController from "../controllers/googleAuth.controller";

export default class GoogleAuthRoute implements Route {
    public path = "/auth";
    public router = Router();
    public googleAuthController = new GoogleAuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}/google`,
            passport.authenticate("google", { scope: ["profile", "email"] })
        );

        this.router.get(
            `${this.path}/google/callback`,
            passport.authenticate("google", {
                session: false,
                failureRedirect: `${this.path}/google/failure`,
            }),
            this.googleAuthController.handleGoogleCallback
        );

        this.router.get(`${this.path}/google/failure`, (req, res) => {
            res.status(401).json({ message: "Google authentication failed" });
        });
    }
}
