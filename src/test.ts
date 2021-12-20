import CryptoController from "./resources/controllers/crypto.controller";
import StockController from "./resources/controllers/stock.controller";
import UserRepository from "./resources/repository/user.repo";
import validateEnv from "./utils/validateEnv";
import App from "./app";


 validateEnv();

 const userRepo: UserRepository = new UserRepository();
 userRepo.initialize();
 
 const app = new App(
     [ new StockController(userRepo), new CryptoController(userRepo)],
     Number(process.env.PORT), process.env.BASE_URL
 );
 
 app.listen();