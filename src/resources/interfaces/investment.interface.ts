export interface Investment {
    initialPPS: number,
    totalShares: number,
    tickerSymbol: string,
    userId: number,
    totalSharePrices: number,
    totalInvestment: number
}

export interface UserStockResponse {
    stocks: Investment[],
    initialInvestment: number
}