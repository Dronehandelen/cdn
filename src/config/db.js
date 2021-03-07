export default {
    host: process.env.CONFIG_DB_HOST || 'postgres',
    user: process.env.CONFIG_DB_USER || 'postgres',
    password: process.env.CONFIG_DB_PASSWORD || 'postgres',
    database: process.env.CONFIG_DB_DATABASE || 'cdn',
    port: 5432,
};
