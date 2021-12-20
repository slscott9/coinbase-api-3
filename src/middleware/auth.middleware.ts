import HttpException from '@/utils/exceptions/http.exception';
import token from '@/utils/token';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '@/resources/repository/user.repo';
import { logInfo } from '@/utils/logger/logger';


async function authenticatedMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<Response | void> {
    const bearer = req.headers.authorization;

    const userRepo: UserRepository = new UserRepository();
    await userRepo.initialize();

    if (!bearer || !bearer.startsWith('Bearer ')) {
        return next(new HttpException(401, 'Unauthorised'));
    }

    const accessToken = bearer.split('Bearer ')[1].trim();

    logInfo('accesToken', 'auth', accessToken)
    try {
        const payload: Token |  jwt.JsonWebTokenError = await token.verifyToken(
            accessToken
        );

        if (payload instanceof jwt.JsonWebTokenError) {
            return next(new HttpException(401, 'Unauthorised'));
        }

        console.log(payload.id)

        const user = await userRepo.getUserById(payload.id)

        logInfo('user from auth middleware', 'AUTH MIDDLEWARE', user)

        logInfo('user', 'auth', user)
        if (!user) {
            return next(new HttpException(401, 'Unauthorised'));
        }

        req.body.user = user

        return next();
    } catch (error) {
        return next(new HttpException(401, 'Unauthorised'));
    }
}

export default authenticatedMiddleware;
