import { logInfo, logError } from "@/utils/logger/logger";
import { Investment } from "../interfaces/investment.interface";
import UserRepository from "../repository/user.repo"

class StockService {

    public userRepo: UserRepository
    public logContext: string = 'STOCK SERVICE'

    constructor(
        userRepo: UserRepository
    ){
        this.userRepo = userRepo
    }


    public async getInitInvestment(userId: number) : Promise<any> {
        try {
            let initialInvestment = await this.userRepo.getStockInitInvestment(userId);
            logInfo('getInitInvestment() - returning initialInvestment', this.logContext, initialInvestment);
            return initialInvestment;
        } catch (error) {
            logError('Error from getInitInvestment()', this.logContext, error)
            throw new Error(error.message);
        }
    }

    public async updateInvestments(userId: number, investmentReq: any): Promise<any> {
        try {
            let investments = await this.calculateTotalInvestments(investmentReq)
            let initInvestment = await this.userRepo.updateStockInvestments(userId, investments);
            logInfo('updateCryptoInvestments() - returning initInvestment', this.logContext, initInvestment);
            return initInvestment

        } catch (error) {
            logError('Error from updateCryptoInvestments()', this.logContext, error)
            throw new Error(error.message);
        }
    }

    public async resetInvestments(userId: number, investmentReq: any): Promise<any> {
        try {
            let investments = await this.calculateTotalInvestments(investmentReq)
            let initInvestment = await this.userRepo.resetStockInvestments(userId, investments);
            logInfo('resetInvestments() - returning initInvestment', this.logContext, initInvestment);
            return initInvestment

        } catch (error) {
            logError('Error from resetInvestments()', this.logContext, error)
            throw new Error(error.message);
        }
    }

    public async getAllInvestments(userId: number): Promise<Investment[]> {
        try {
            let investments: Investment[] = await this.userRepo.getAllInvestments(userId, false);
            logInfo('getAllInvestments() - returning investments', this.logContext, investments)
            return investments
        } catch (error) {
            logError('Error from getAllInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
    }
  
    private async calculateTotalInvestments(investments: Investment[]): Promise<Investment[]> {
        for(let investment of investments) {
            investment.totalInvestment = investment.initialPPS * investment.totalShares
        }

        return investments
    }


}

export default StockService