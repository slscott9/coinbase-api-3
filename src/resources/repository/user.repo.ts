import { logError, logInfo } from "@/utils/logger/logger";
import { string } from "joi";
import pgPromise, { IMain } from "pg-promise";
import { Investment } from "../interfaces/investment.interface";

class UserRepository {

    pgp: IMain
    db: any;
    PQ: any;
    logContext: string = 'User Repository'

    constructor() {
        this.pgp = pgPromise();
    }

    async initialize() {
        try {
            this.db = this.pgp({
                host: process.env.DB_HOST,
                port: 5432,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD

            });
        } catch (error) {
            logError('There was an error connecting to database', this.logContext, error);
            throw new Error(error.message);
        }
    }

    //USER
    async getUser(
        email: string
    ): Promise<any> {

    }

    async getUserById(
        userId: number
    ): Promise<any> {
        try {
            let userInsert = `select jsonb_agg(
                                jsonb_build_object(
                                    'userId', user_id,
                                    'firstName', first_name,
                                    'lastName', last_name,
                                    'userName', user_name,
                                    'email', email,
                                    'selectedCurrency', selected_currency,
                                    'stockInitialInvestment', stock_init_investment,
                                    'cryptoInitialInvestment', crypto_init_investment,                                    
                                    'totalProfit', total_profit,
                                    'password', password
                                )  
                            ) as "user"
                            from coinbase.user u
                            where u.user_id = $1`

            let queryResult = await this.db.any(userInsert, userId);
            logInfo('getUserById() - returning user', this.logContext, queryResult[0].user[0])
            return queryResult[0].user[0]

        } catch (error) {
            logError('There was an error in loginUser()', this.logContext, error);
            throw new Error(error.message);

        }
    }

    async createUser(
        requestBody: any
    ): Promise<any> {
        try {
            let userInsert = `insert into coinbase.user(first_name, last_name, user_name, email, selected_currency, password)
                         values(($1), ($2), ($3), ($4), ($5), ($6))
                         returning 
                         user_id as "userId",
                         first_name as "firstName",
                         last_name as "lastName",
                         user_name as "userName",
                         email as "email",
                         selected_currency as "selectedCurrency",
                         password as "password"`

            let queryResult = await this.db.any(
                userInsert,
                [
                    requestBody.firstName,
                    requestBody.lastName,
                    requestBody.userName,
                    requestBody.email,
                    requestBody.selectedCurrency,
                    requestBody.password
                ]
            );
            logInfo(' createUser() - queryResult[0]', this.logContext, queryResult[0])
            return queryResult[0]
        } catch (error) {
            logError('There was an error in createUser()', this.logContext, error);
            throw new Error(error.message);

        }
    }


    async saveProfit(userId: number, totalProfit: number): Promise<any> {
        try {
            let query = `update coinbase.user
                         set total_profit = ($1)
                         where user_id = ($2)
                         returning total_profit as "totalProfit"`
            
            let queryResult = await this.db.any(query, [totalProfit, userId])
            logInfo('saveProfit() - queryResult[0].totalProfit', this.logContext, queryResult[0].totalProfit)
            return queryResult[0].totalProfit
        } catch (error) {
            logError('ERROR from saveProfit()', this.logContext, error);
            throw new Error(error.message)
            
        }
    }

    async getTotalShares(
        userId: number,
        isCrypto: boolean
    ): Promise<any | undefined> {
        try {
            let query = `select ticker_symbol , sum(total_shares) from coinbase.user_initial_inv_info uiii 
                        where user_id = ($1)
                        where is_crypto = ($2)
                        group by ticker_symbol`

            let queryResult = await this.db.any(query, [userId, isCrypto]);
            logInfo('getTotalShares() - queryResult', this.logContext, queryResult)
            return queryResult
        } catch (error) {
            logError('There was an error in getTotalShares()', this.logContext, error);
            throw new Error(error.message);
        }
    }

    async getStockSymbols(userId: number, isCrypto: boolean): Promise<any> {
        try {
            let query = `select ticker_symbol from coinbase.user_initial_inv_info
                         where user_id = ($1),
                         and is_crypto = ($2)
                         group by ticker_symbol`
            
            let queryResult = await this.db.any(query, [userId, isCrypto]);
            logInfo('getStockSymbols() - queryResult', this.logContext, queryResult)
            return queryResult
        } catch (error) {
            logError('ERROR from getStockSymbol()', this.logContext, error);
            throw new Error(error.message)
        }
    }

    public async getAllInvestments(userId: number, isCrypto: boolean) : Promise<any> {
        try {
            let query =
                `select jsonb_agg(
                jsonb_build_object(
                    'userId', user_id,
                    'initialPPS', initial_pps,
                    'totalShares', total_shares,
                    'tickerSymbol', ticker_symbol,
                    'totalInvestment', total_investment
                )
            ) as "investments"
            from coinbase.user_initial_inv_info uiii where user_id = ($1)
            and is_crypto = ($2)`

            let queryResult = await this.db.any(query, [userId, isCrypto])
            logInfo('getAllInvestments() - queryResult[0]', this.logContext, queryResult[0])
            return queryResult[0];
        } catch (error) {
            logError('There was an error in getAllInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
    }


    //CRYPTO

    async getCryptoInitInvestment(
        userId: number
    ): Promise<any | undefined> {
        try {
            let query = `select crypto_init_investment from coinbase.user u
                                where u.user_id = ($1)`

            let queryResult = await this.db.any(query, [userId]);
            logInfo('getInitInvestment() - queryResult[0].init_investment', this.logContext, queryResult[0].init_investment)
            return queryResult[0].init_investment
        } catch (error) {
            logError('There was an error in getInitInvestment()', this.logContext, error);
            throw new Error(error.message);
        }
    }

    //for loop in service to set each investments totalInvestment
    async updateCryptoInvestments(
        userId: number,
        investments: Investment[],
    ): Promise<any> {
        try {
            let queryResult = await this.db.tx('update-investments',async (t:any) => {
                const queries = investments.map((investment: any) => {
                    return t.one(
                        `insert into coinbase.user_initial_inv_info(initial_pps, total_shares, ticker_symbol, user_id, total_investment, is_crypto)
                         values(($1), ($2), ($3), ($4), true)
                         returning 
                         initial_pps as "initialPPS",
                         total_shares as "totalShares",
                         ticker_symbol as "tickerSymbol",
                         user_id as "userId",
                         total_investment as "totalInvestment",
                         is_crypto as "isCrypto"`,
                        [
                            investment.initialPPS,
                            investment.totalShares,
                            investment.tickerSymbol,
                            investment.userId,
                            investment.totalInvestment
                        ],
                        (a: any) => a.id
                    )
                });
    
                await t.batch(queries);
    
                let queryResult = await t.any(
                    `select sum(total_investment) as "totalInvestments"
                     from coinbase.user_initial_inv_info uiii 
                     where user_id = $1
                     and is_crypto = true`,
                    userId
                )
    
                return await t.any(
                    `update coinbase.user
                     set crypto_init_investment = ($1)
                     where user_id = ($2)
                     returning crypto_init_investment as "cryptoInitInvestment"`,
                     [queryResult[0].totalInvestments, userId]
                )
            });
            logInfo('updateCryptoInvestments() - queryResult[0].cryptoInitInvestment', this.logContext, queryResult[0].cryptoInitInvestment)
            return queryResult[0].cryptoInitInvestment
        } catch (error) {
            logError('There was an error in updateCryptoInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
    }



    async resetCryptoInvestments(
        userId: number,
        investments: Investment[],
    ): Promise<any> {
        try {
            let queryResult = await this.db.tx('update-investments',async (t:any) => {

                await t.any(
                    `delete from coinbase.user_initial_inv_info
                     where user_id = $1
                     and is_crypto = true`,
                    userId
                )
                const queries = investments.map((investment: any) => {
                    return t.one(
                        `insert into coinbase.user_initial_inv_info(initial_pps, total_shares, ticker_symbol, user_id, total_investment, is_crypto)
                         values(($1), ($2), ($3), ($4), true)
                         returning 
                         initial_pps as "initialPPS",
                         total_shares as "totalShares",
                         ticker_symbol as "tickerSymbol",
                         user_id as "userId",
                         total_investment as "totalInvestment",
                         is_crypto as "isCrypto"`,
                        [
                            investment.initialPPS,
                            investment.totalShares,
                            investment.tickerSymbol,
                            investment.userId,
                            investment.totalInvestment,
                        ],
                        (a: any) => a.id
                    )
                });
    
                await t.batch(queries);
    
                let queryResult = await t.any(
                    `select sum(total_investment) as "totalInvestments"
                     from coinbase.user_initial_inv_info uiii 
                     where user_id = $1
                     and is_crypto = true`,
                    userId
                )
    
                return await t.any(
                    `update coinbase.user
                     set crypto_init_investment = ($1)
                     where user_id = ($2)
                     returning crypto_init_investment as "cryptoInitInvestment"`,
                     [queryResult[0].totalInvestments, userId]
                )
            });
            logInfo('updateCryptoInvestments() - queryResult[0].cryptoInitInvestment', this.logContext, queryResult[0].cryptoInitInvestment)
            return queryResult[0].cryptoInitInvestment
        } catch (error) {
            logError('There was an error in updateCryptoInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
        
    }

    


    //STOCK

    async getStockInitInvestment(
        userId: number
    ): Promise<any | undefined> {
        try {
            let query = `select stock_init_investment from coinbase.user u
                                where u.user_id = ($1)`

            let queryResult = await this.db.any(query, [userId]);
            logInfo('getInitInvestment() - queryResult[0].init_investment', this.logContext, queryResult[0].init_investment)
            return queryResult[0].init_investment
        } catch (error) {
            logError('There was an error in getInitInvestment()', this.logContext, error);
            throw new Error(error.message);
        }
    }

    async updateStockInvestments(
        userId: number,
        investments: Investment[],
    ): Promise<any> {
        try {
            let queryResult = await this.db.tx('update-investments',async (t:any) => {
                const queries = investments.map((investment: any) => {
                    return t.one(
                        `insert into coinbase.user_initial_inv_info(initial_pps, total_shares, ticker_symbol, user_id, total_investment, is_crypto)
                         values(($1), ($2), ($3), ($4), true)
                         returning 
                         initial_pps as "initialPPS",
                         total_shares as "totalShares",
                         ticker_symbol as "tickerSymbol",
                         user_id as "userId",
                         total_investment as "totalInvestment",
                         is_crypto as "isCrypto"`,
                        [
                            investment.initialPPS,
                            investment.totalShares,
                            investment.tickerSymbol,
                            investment.userId,
                            investment.totalInvestment,
                        ],
                        (a: any) => a.id
                    )
                });
    
                await t.batch(queries);
    
                let queryResult = await t.any(
                    `select sum(total_investment) as "totalInvestments"
                     from coinbase.user_initial_inv_info uiii 
                     where user_id = $1
                     and is_crypto = false`,
                    userId
                )
    
                return await t.any(
                    `update coinbase.user
                     set stock_init_investment = ($1)
                     where user_id = ($2)
                     returning stock_init_investment as "stockInitInvestment"`,
                     [queryResult[0].totalInvestments, userId]
                )
            });
            logInfo('updateStockInvestments() - queryResult[0].stockInitInvestment', this.logContext, queryResult[0].stockInitInvestment)
            return queryResult[0].stockInitInvestment
        } catch (error) {
            logError('There was an error in updateStockInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
    }


    async resetStockInvestments(
        userId: number,
        investments: Investment[],
    ): Promise<any> {
        try {
            let queryResult = await this.db.tx('update-investments',async (t:any) => {

                await t.any(
                    `delete from coinbase.user_initial_inv_info
                     where user_id = $1
                     and is_crypto = false`,
                    userId
                )
                const queries = investments.map((investment: any) => {
                    return t.one(
                        `insert into coinbase.user_initial_inv_info(initial_pps, total_shares, ticker_symbol, user_id, total_investment, is_crypto)
                         values(($1), ($2), ($3), ($4), true)
                         returning 
                         initial_pps as "initialPPS",
                         total_shares as "totalShares",
                         ticker_symbol as "tickerSymbol",
                         user_id as "userId",
                         total_investment as "totalInvestment",
                         is_crypto as "isCrypto"`,
                        [
                            investment.initialPPS,
                            investment.totalShares,
                            investment.tickerSymbol,
                            investment.userId,
                            investment.totalInvestment,
                        ],
                        (a: any) => a.id
                    )
                });
    
                await t.batch(queries);
    
                let queryResult = await t.any(
                    `select sum(total_investment) as "totalInvestments"
                     from coinbase.user_initial_inv_info uiii 
                     where user_id = $1
                     and is_crypto = false`,
                    userId
                )
    
                return await t.any(
                    `update coinbase.user
                     set stock_init_investment = ($1)
                     where user_id = ($2)
                     returning stock_init_investment as "stockInitInvestment"`,
                     [queryResult[0].totalInvestments, userId]
                )
            });
            logInfo('updateStockInvestments() - queryResult[0].stockInitInvestment', this.logContext, queryResult[0].stockInitInvestment)
            return queryResult[0].stockInitInvestment
        } catch (error) {
            logError('There was an error in updateStockInvestments()', this.logContext, error);
            throw new Error(error.message);
        }
    }
    
   



    

}

export default UserRepository