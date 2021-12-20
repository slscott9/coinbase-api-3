import HttpException from "@/utils/exceptions/http.exception";
import Controller from "@/utils/interface/controller.interface";
import { logInfo, logError } from "@/utils/logger/logger";
import { NextFunction, Router, Request, Response } from "express";
import UserRepository from "../repository/user.repo";
import CoinbaseService from "../services/coinbase.service";

class CoinbaseController implements Controller {

    public path = '/coinbase';
    public router = Router();
    public service: CoinbaseService
    private logContext: string = 'COINBASE CONTROLLER'

    constructor(
        userRepo: UserRepository
    ){
        this.initRoutes();
        this.service = new CoinbaseService(userRepo);
    }

    private initRoutes() {
        this.router.post(
            `${this.path}/current/totals`,
            this.currentPriceTotals
        )
        this.router.post(
            `${this.path}/current`,
            this.getCurrentPrices
        )
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


}

export default CoinbaseController