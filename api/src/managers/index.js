const fs = require('fs');
const cron = require('cron');
const events = require('events');
const db = require("../models/index.js");

const Op = db.Sequelize.Op;
const Sessions = db.sessions;

const uploadDir = process.env.UPLOADS_DIR;

module.exports.sessionManager = new cron.CronJob(" * * * * * ", async () => {
    try {
        console.log("Session manager task start");
        const expireTime = process.env.SESSION_EXP;
        const found = await Sessions.findAll({
            where: {
                updated_at: { [Op.lt]: db.Sequelize.literal(`NOW() - (INTERVAL '${expireTime} MINUTE')`) },
                [Op.or] : [{ status: "entered" }, { status: "converted" } ]} });              
                
        if (found) {
            for(const session of found) {
                console.log(`${session.session_id} will be closed with status ${session.status}`);
                if (session.status !== "entered") {
                    fs.unlink(uploadDir + session.session_id, (err) => err && console.error(err));
                }
                await db.closeSession(session.session_id);
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        console.log("Session manager task end");
    }
});

const eventEmitter = new events();
eventEmitter.on('convert', async (sessionId) => {
    try {
        console.log("File conversion task start");
        if (!fs.existsSync(uploadDir + sessionId))
            throw new Error("File not exist");

        const row1 = await Sessions.update({ 
            status: "converting" }, {
            where: { session_id: sessionId, status: "uploaded" } });
        if (row1 === 0) {
            throw new Error("DB update status to converting error")
        }
        
        // TODO: transcoding
        fs.copyFileSync(uploadDir + sessionId, uploadDir + sessionId + '-done');

        fs.unlink(uploadDir + sessionId, (err) => err && console.error(err));
        fs.renameSync(uploadDir + sessionId + "-done", uploadDir + sessionId);
        const row2 = await Sessions.update({ 
            status: "converted" }, {
            where: { session_id: sessionId, status: "converting" } });
        if (row2 === 0) {
            throw new Error("DB update status to converted error")
        }
    } catch(err) {
        console.error(err);
    } finally {
        console.log("File conversion task end");
    }
});

module.exports.fileConverter = (sessionId) => {
    eventEmitter.emit("convert", sessionId);
}