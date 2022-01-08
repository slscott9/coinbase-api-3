import { logInfo, logError } from "@/utils/logger/logger";
import { url } from "inspector";
import UserRepository from "../repository/user.repo";
import ApiService from "./api.service";

class FinancialModelService {

    private apiRepo: ApiService;
    private userRepo: UserRepository
    private logContext: string = 'FINANCIAL MODEL SERVICE'
  
    constructor(userRepo: UserRepository) {
      this.userRepo = userRepo
      this.apiRepo = new ApiService();
    }


    public async currentPriceTotals(userId: number, isCrypto: boolean) {
        try {
          logInfo('currentPriceTotals() isCrypto', this.logContext, isCrypto)
          let userInvestments: any[] = await this.userRepo.getTotalShares(userId, isCrypto)
          logInfo('currentPriceTotals() - userInvestments', this.logContext, userInvestments)
          let currentPrices: any[] = await this.getCurrentPrices(isCrypto, userId, userInvestments)
          let totalCurrentPrices: number = 0
    
          for (let i = 0; i < userInvestments.length; i++) {
              console.log(currentPrices[i].tickerSymbol)
              console.log(userInvestments[i].ticker_symbol)
            if (currentPrices[i].tickerSymbol === userInvestments[i].ticker_symbol) {
                logInfo('IN IF STATEMENT', this.logContext, null)
              totalCurrentPrices += (currentPrices[i].price * userInvestments[i].sum)
            }
          }
    
          logInfo('currentPriceTotals() - returing totalCurrentPrices', this.logContext, totalCurrentPrices)
          return totalCurrentPrices
        } catch (error) {
          logError('Error in currentPriceTotals()', this.logContext, error);
          throw new Error(error.message);
        }
      }

      public async getCurrentPrices(isCrypto: boolean, userId?: number, userInvestments?: any[]): Promise<any> {
        try {
            let currentPrices: any[] = [];
            let urls: string[] = [];
      
            if (userInvestments) {
              urls = await this.buildUrls(userInvestments)
              currentPrices = await this.processApiRequests(urls)
            } else {
              let tickerSymbols = await this.userRepo.getStockSymbols(userId, isCrypto);
              urls = await this.buildUrls(tickerSymbols)
              currentPrices = await this.processApiRequests(urls)
            }

            logInfo('current prices from api request', this.logContext, currentPrices)
      
            logInfo('getCurrentPrices() - returning currentPrices', this.logContext, currentPrices)
            return await this.buildResponse(currentPrices);
          } catch (error) {
            logError('Error in getCurrentPrices()', this.logContext, error);
            throw new Error(error.message);
          }
      }

      private async processApiRequests(urls: string[]): Promise<any> {
        let currentPrices: any[] = []

        for(let url of urls) {
          currentPrices.push(
            await this.apiRepo.apiGetRequest(url)
          )
        }
        return currentPrices
      }

      private async buildUrls(symbols: any[]): Promise<any> {
        let urls: string[] = []
        let newURl = 'https://financialmodelingprep.com/api/v3/quote-short/'

        for(let symbol of symbols){
          urls.push(
            newURl + symbol.ticker_symbol + `?apikey=${process.env.FM_API_KEY}`
          )
        }

        return urls

      }


      //financialmodelingprep.com no longer allows batch requests on free acccount

      // private async buildURL(tickerSymbols: any[]): Promise<any> {
      //   let newURl = 'https://financialmodelingprep.com/api/v3/quote-short/'
    
      //   for (let i = 0; i < tickerSymbols.length; i++) {
      //     if (i === tickerSymbols.length - 1) {
      //       newURl += tickerSymbols[i].ticker_symbol
      //     } else {
      //       newURl += tickerSymbols[i].ticker_symbol + ','
      //     }
      //   }
    
      //   logInfo('buildRequest() - newURL', this.logContext, newURl + `?apikey=${process.env.FM_API_KEY}`)
      //   return newURl += `?apikey=${process.env.FM_API_KEY}`
      // }

      private async buildResponse(marketData: any): Promise<any> {
        logInfo('market data from api call', this.logContext, JSON.stringify(marketData))
        try {
          let formattedData: any[] = []
    
          for (let data of marketData) {
            formattedData.push(
              {
                tickerSymbol: data.symbol,
                price: data.price
    
              }
            )
          }
          logInfo('buildResponse() - formattedData', this.logContext, formattedData)
    
          return formattedData
        } catch (error) {
          logError('Error from buildResponse()', this.logContext, error)
        }
      }

}

export default FinancialModelService