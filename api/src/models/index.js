const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.port,
    define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.sessions = require("./sessions.model.js")(sequelize, Sequelize);
db.closeSession = async function(sessionId) {
    try {
        await this.sessions.update({ 
            status: "closed", 
            // let session_id = id
            session_id: db.sequelize.literal('id') }, {
            where: { session_id: sessionId }
        })
        console.log(`${sessionId} closed`);
    } catch (err) {
        console.error(err);
    }
}

module.exports = db;
