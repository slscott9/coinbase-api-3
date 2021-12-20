import authenticatedMiddleware from "@/middleware/auth.middleware";
import HttpException from "@/utils/exceptions/http.exception";
import { logInfo, logError } from "@/utils/logger/logger";
import { NextFunction, Router, Request, Response } from "express";
import { Investment } from "../interfaces/investment.interface";
import UserRepository from "../repository/user.repo";
import CryptoService from "../services/crypto.service";

class CryptoController {
    public path = '/crypto';
    public router = Router();
    public cryptoService: CryptoService
    public logContext: string = 'User Controller'

    constructor(userRepo: UserRepository) {
        this.initRoutes();
        this.cryptoService = new CryptoService(userRepo)
    }

    public initRoutes() {
        this.router.post(
            `${this.path}/investment`,
            authenticatedMiddleware,
            this.getInitInvestment
        )
        this.router.post(
            `${this.path}/investments`,
            authenticatedMiddleware,
            this.getAllInvestments
        )
        this.router.post(
            `${this.path}/investments/update`,
            authenticatedMiddleware,
            this.updateInvestments
        )
     

        // this.router.get(`${this.path}`, authenticatedMiddleware, this.getUser);
    }

    private getInitInvestment = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('getUserInitInvestment() - incoming request', this.logContext, req.body)
            let initialInvestment = await this.cryptoService.getInitInvestment(req.body.userId);
            res.status(200).send({initialInvestment: initialInvestment})
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    }

    private getAllInvestments = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            logInfo('getAllInvestments() - incoming request', this.logContext, req.body)
            let investments: Investment[] = await this.cryptoService.getAllInvestments(req.body.userId);
            logInfo('Response from getAllInvestments()', this.logContext, JSON.stringify(investments))
            res.status(200).send(investments)
        } catch (error) {
            logInfo('Error from getAllInvestments', this.logContext, error);
            next(new HttpException(400, error.message));

        }
    }

    private updateInvestments = async(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            let initialInvestment: number = 0;
            logInfo('Incoming request in calcluateInitInvestment()', this.logContext, JSON.stringify(req.body))
            if(req.body.isUpdate){
                initialInvestment = await this.cryptoService.updateInvestments(req.body.userId, req.body.investments);
            }else{
                initialInvestment = await this.cryptoService.resetInvestments(req.body.userId, req.body.investments)
            }

            logInfo('Returning request from calculateInitInvestment()', this.logContext, {initialInvestment: initialInvestment})
            res.status(200).send({initialInvestment: initialInvestment})
        } catch (error) {
            logError('Error from calculateInitInvestment()', this.logContext, error);
            next(new HttpException(400, error.message));

        }
    }

   

}

export default CryptoController