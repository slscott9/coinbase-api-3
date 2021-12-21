import authenticatedMiddleware from "@/middleware/auth.middleware";
import HttpException from "@/utils/exceptions/http.exception";
import { logInfo, logError } from "@/utils/logger/logger";
import { NextFunction, Router, Request, Response } from "express";
import UserRepository from "../repository/user.repo";
import CoinMarketService from "../services/coinmarket.service";

class CoinMarketController {

    public path = '/coinmarket';
    public router = Router();
    public service: CoinMarketService
    private logContext: string = 'COIN MARKGET CONTROLLER'

    constructor(
        userRepo: UserRepository
    ){
        this.initRoutes();
        this.service = new CoinMarketService(userRepo);
    }

    private initRoutes() {
        this.router.post(
            `${this.path}/current/totals`,
            authenticatedMiddleware,
            this.currentPriceTotals
        )
        this.router.post(
            `${this.path}/current`,
            authenticatedMiddleware,
            this.getCurrentPrices
        )

        this.router.get(`${this.path}/user`, authenticatedMiddleware, this.getUser);
    }
    
    private currentPriceTotals = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('currentPriceTotals() - incoming request', this.logContext, req.body)
            let currentPriceTotals = await this.service.currentPriceTotals(req.body.userId)
            res.status(200).send({currentPriceTotals: currentPriceTotals})
        } catch (error) {
            logError('Error in currentPriceTotals()', this.logContext, error);
            next(new HttpException(400, error.message));
        }
    }

    private getCurrentPrices = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('currentPriceTotals() - incoming request', this.logContext, req.body)
            let currentPrices = await this.service.getCurrentPrices(req.body.userId, undefined)
            res.status(200).send({currentPrices: currentPrices})
        } catch (error) {
            logError('Error in getCurrentPrices()', this.logContext, error);
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

export default CoinMarketController