const port = process.env.PORT || 3000;

const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

const db_url = process.env.MONGODB_URI || 'mongodb://localhost/carSimulationApp';

module.exports = {
    port: port,
    host: host,
    db: db_url,
};
