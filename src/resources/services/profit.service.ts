import UserRepository from "../repository/user.repo"

class ProfitService {

    public userRepo: UserRepository
    public logContext: string = 'UserService'

    constructor(
        userRepo: UserRepository
    ){
        this.userRepo = userRepo
    }

    

}

export default ProfitService