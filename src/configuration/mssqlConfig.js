import dotenv from 'dotenv';

const properties = dotenv.config().parsed;
const {
    DB_INSTANCE,
    DB_NAME,
    DB_USER,
    DB_PASS
} = properties;

export { properties };
export default {
    user: DB_USER,
    password: DB_PASS || 'sa',
    database: DB_NAME || '123',
    server: DB_INSTANCE || 'DB_SUPER',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 3e4
    },
    options: {
        encrypt: true,
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};