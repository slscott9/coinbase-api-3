import { logInfo, logError } from "@/utils/logger/logger";
import UserRepository from "../repository/user.repo";
import ApiService from "./api.service";

class CoinbaseService {

    private apiRepo: ApiService;
    private userRepo: UserRepository
    private logContext: string = 'COINBASE SERVICE'
  
    constructor(userRepo: UserRepository) {
      this.userRepo = userRepo
      this.apiRepo = new ApiService();
    }

    public async currentPriceTotals(userId: number) {
      try {
        let userInvestments: any[] = await this.userRepo.getTotalShares(userId, true)
        let currentPrices: any[] = await this.getCurrentPrices(undefined, userInvestments)
        let totalCurrentPrices: number = 0
  
        for (let i = 0; i < userInvestments.length; i++) {
          if (currentPrices[i].tickerSymbol === userInvestments[i].ticker_symbol) {
            totalCurrentPrices += (+currentPrices[i].price * userInvestments[i].sum)
          }
        }
  
        logInfo('currentPriceTotals() - returing totalCurrentPrices', this.logContext, totalCurrentPrices)
        return totalCurrentPrices
      } catch (error) {
        logError('Error in currentPriceTotals()', this.logContext, error);
        throw new Error(error.message);
      }
    }
  
    public async getCurrentPrices(userId?: number, userInvestments?: any[]): Promise<any> {
      try {
        let currentPrices: any[] = [];
  
        if (userInvestments) {
          currentPrices = await this.formatCurrentPrices(userInvestments)
        } else {
          let tickerSymbols = await this.userRepo.getStockSymbols(userId, true);
          currentPrices = await this.formatCurrentPrices(tickerSymbols);
        }

        logInfo('getCurrentPrices() - returning currentPrices', this.logContext, currentPrices)
        return currentPrices;
      } catch (error) {
        logError('Error in getCurrentPrices()', this.logContext, error);
        throw new Error(error.message);
      }
    }

    private async formatCurrentPrices(tickerSymbols: any[]): Promise<any> {
      let currentPrices: any[] = [];

      for (let symbols of tickerSymbols) {
        let response = await this.apiRepo.apiGetRequest(`https://api.coinbase.com/v2/prices/${symbols.ticker_symbol}-USD/buy`)
        currentPrices.push(
          {
            tickerSymbol: response.data.base,
            price: response.data.amount
          }
        )
      }

      return currentPrices;
    }
}

export default CoinbaseService