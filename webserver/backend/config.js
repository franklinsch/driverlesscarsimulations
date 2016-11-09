const port = process.env.PORT || 3000;

const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

const db_url = process.env.MONGODB_URI || 'mongodb://localhost/carSimulationApp';

const TOKEN_SECRET = "OUR_VERY_SECRET_KEY"

module.exports = {
    port: port,
    host: host,
    db: db_url,
    token_secret: TOKEN_SECRET,
};
