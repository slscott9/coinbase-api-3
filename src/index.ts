import App from "./app";
import 'module-alias/register';
import 'dotenv/config';
import AuthController from "./resources/controllers/auth.controller";
import CoinbaseController from "./resources/controllers/coinbase.controller";
import CryptoController from "./resources/controllers/crypto.controller";
import StockController from "./resources/controllers/stock.controller";
import UserControler from "./resources/controllers/user.controllers";
import UserRepository from "./resources/repository/user.repo";
import validateEnv from "./utils/validateEnv";


 validateEnv();

 const userRepo: UserRepository = new UserRepository();
 userRepo.initialize();
 
 const app = new App(
    [ 
        new StockController(userRepo), 
        new CryptoController(userRepo),
        new CoinbaseController(userRepo),
        new AuthController(userRepo),
        new UserControler(userRepo)
    ],
     Number(process.env.PORT), process.env.BASE_URL
 );
 
 app.listen();