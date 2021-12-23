import App from "./app";
import 'module-alias/register';
import 'dotenv/config';
import AuthController from "./resources/controllers/auth.controller";
import CryptoController from "./resources/controllers/crypto.controller";
import StockController from "./resources/controllers/stock.controller";
import UserControler from "./resources/controllers/user.controllers";
import UserRepository from "./resources/repository/user.repo";
import validateEnv from "./utils/validateEnv";
import CoinMarketService from "./resources/services/coinmarket.service";
import CoinMarketController from "./resources/controllers/coinmarket.controller";
import FinancialModelController from "./resources/controllers/financialModel.controller";


 validateEnv();

 const userRepo: UserRepository = new UserRepository();
 userRepo.initialize();
 
 const app = new App(
    [ 
        new StockController(userRepo), 
        new CryptoController(userRepo),
        new AuthController(userRepo),
        new UserControler(userRepo),
        new CoinMarketController(userRepo),
        new FinancialModelController(userRepo)
    ],
     Number(process.env.PORT), process.env.BASE_URL
 );
 
 app.listen();