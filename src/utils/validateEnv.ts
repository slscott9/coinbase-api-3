import {cleanEnv, str, port} from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production']
        }),
        DB_PASSWORD: str(),
        DB_USER: str(),
        DB_PORT: port({default: 3000})
    })
}

export default validateEnv;
