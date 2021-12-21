import { logInfo, logError } from "@/utils/logger/logger"
import UserRepository from "../repository/user.repo"
import ApiService from "./api.service";


class CoinMarketService {

  private apiRepo: ApiService;
  private userRepo: UserRepository
  private logContext: string = 'COIN MARKET SERVICE'

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

  private async formatCurrentPrices(tickerSymbols: any): Promise<any> {
    let currentPrices: any[] = [];

    let response = await this.apiRepo.apiGetRequest(
      await this.buildRequest(tickerSymbols), ['X-CMC_PRO_API_KEY', process.env.CM_API_KEY]
    )

    logInfo('formatCurrentPrices() - response', this.logContext, response)

    currentPrices = await this.buildResponse(response, tickerSymbols)
    return currentPrices;
  }

  private async buildRequest(tickerSymbols: any[]): Promise<any> {
    let newURl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol='

    for (let i = 0; i < tickerSymbols.length; i++) {
      if (i === tickerSymbols.length - 1) {
        newURl += tickerSymbols[i].ticker_symbol
      } else {
        newURl += tickerSymbols[i].ticker_symbol + ','
      }
    }

    logInfo('buildRequest() - newURL', this.logContext, newURl)
    return newURl
  }

  private async buildResponse(marketData: any, symbols: any[]): Promise<any> {
    try {
      let formattedData: any[] = []

      for (let i = 0; i < symbols.length; i++) {
        formattedData.push(
          {
            tickerSymbol: marketData.data[symbols[i].ticker_symbol].symbol,
            price: marketData.data[symbols[i].ticker_symbol].quote.USD.price

          }
        )
      }

      return formattedData
    } catch (error) {
      logError('Error from buildResponse()', this.logContext, error)
    }
  }

}

export default CoinMarketService