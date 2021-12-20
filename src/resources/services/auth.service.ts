import { logInfo, logError } from "@/utils/logger/logger";
import token from "@/utils/token";
import { User } from "../interfaces/user.interface";
import UserRepository from "../repository/user.repo"

class AuthService {

    public userRepo: UserRepository
    public logContext: string = 'UserService'

    constructor(
        userRepo: UserRepository
    ){
        this.userRepo = userRepo
    }

    public async register(requestBody: any): Promise<any> {
        try {
            let user: User  = await this.userRepo.createUser(requestBody);

            const accessToken = token.createToken(user);

            let userResponse = {
                user: user,
                token:accessToken
            }

            logInfo('register() - returning userResponse', this.logContext, userResponse)
            return userResponse;
        } catch (error) {
            logError('Error from createUser()', this.logContext, error)
            throw new Error('Error registering user.')
        }
    }

    public async login(email: string, password: string ): Promise<any> {
        try {
            const user: User = await this.userRepo.getUser(email);

            if(!user){
                throw new Error('Unable to find user')
            }

            if(password == user.password){
                let loginResponse = {
                    token: token.createToken(user),
                    user: user
                }
                return loginResponse
            }else{
                throw new Error('Wrong login info')
            }

        } catch (error) {
            logError('Error from loginUser()', this.logContext, error)
            throw new Error('Unable to login user')
        }
    }


}

export default AuthService