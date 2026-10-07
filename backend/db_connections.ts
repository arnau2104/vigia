import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '.env') });

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value == undefined) throw new Error(`Falta la variable de entorno ${name}`);
    return value;
}


const config = {
    host: requireEnv('DB_HOST'),
    port: Number(requireEnv('DB_PORT')),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    dateStrings: true, 

}

export const connection = mysql.createPool(config);