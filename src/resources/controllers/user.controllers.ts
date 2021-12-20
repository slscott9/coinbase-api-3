import HttpException from "@/utils/exceptions/http.exception";
import { logError, logInfo } from "@/utils/logger/logger";
import { NextFunction, Router, Request, Response } from "express";
import UserRepository from "../repository/user.repo";
import UserService from "../services/user.service";


class UserControler {

    public path = '/user';
    public router = Router();
    public userService: UserService
    public logContext: string = 'UserController'

    constructor(userRepo: UserRepository) {
        this.initRoutes();
        this.userService = new UserService(userRepo)
    }

    public initRoutes() {

    }


    private getInitInvestment = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('getUserInitInvestment() - incoming request', this.logContext, req.body)
            let initialInvestment = await this.userService.getInitInvestment(req.body.userId);
            res.status(200).send({initialInvestment: initialInvestment})
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    }

    private saveTotalProfit = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('saveTotalProfit() - incoming request', this.logContext, req.body)
            let totalProfit = await this.userService.saveTotalProfit(req.body.userId, req.body.totalProfit)
            res.status(200).send({totalProfit: totalProfit})
        } catch (error) {
            logError('Error from saveTotalProfit()', this.logContext, error);
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

export default UserControler