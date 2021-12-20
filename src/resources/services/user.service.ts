import { logInfo, logError } from "@/utils/logger/logger";
import token from "@/utils/token";
import { User } from "../interfaces/user.interface";
import UserRepository from "../repository/user.repo"

class UserService {

    public userRepo: UserRepository
    public logContext: string = 'USER SERVICE'

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

    public async saveTotalProfit(userId: number, totalProfit: number): Promise<number> {
        try {
            let totalProfitResult: number = await this.userRepo.saveProfit(userId, totalProfit);
            logInfo('saveTotalProfit() - returning totalProfitResult', this.logContext, totalProfitResult);
            return totalProfitResult
        } catch (error) {
            logError('Error from saveTotalProfit()', this.logContext, error);
            throw new Error(error.message);
        }
    }

}

export default UserService