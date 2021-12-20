import HttpException from "@/utils/exceptions/http.exception";
import { logInfo } from "@/utils/logger/logger";
import UserRepository from "../repository/user.repo";
import UserService from "../services/user.service";
import { NextFunction, Router, Request, Response } from "express";
import AuthService from "../services/auth.service";
import authenticatedMiddleware from "@/middleware/auth.middleware";

class AuthController {

    public path = '/auth';
    public router = Router();
    public authService: AuthService
    public logContext: string = 'AUTH CONTROLLER'

    constructor(userRepo: UserRepository) {
        this.initRoutes();
        this.authService = new AuthService(userRepo)
    }

    public initRoutes() {

        this.router.post(
            `${this.path}/register`,
            this.register
        )
        this.router.post(
            `${this.path}/login`,
            this.loginUser
        )

        this.router.get(`${this.path}`, authenticatedMiddleware, this.getUser);


    }

    private register = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('register() - incoming request', this.logContext, req.body)
            let userResponse: any = await this.authService.register(req.body);
            res.status(200).send(userResponse)
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    }

    private loginUser = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('loginUser() - incoming request', this.logContext, req.body)
            let response = await this.authService.login(req.body.email, req.body.password);
            res.status(200).send(response)
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    }

    private getUser = (
        req: Request,
        res: Response,
        next: NextFunction
    ): Response | void => {
        if (!req.body.user) {
            return next(new HttpException(404, 'No logged in user'));
        }

        res.status(200).send({ data: req.body.user });
    };



    
}

export default AuthController