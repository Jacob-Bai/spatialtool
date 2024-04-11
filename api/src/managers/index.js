const fs = require('fs');
const db = require("../models/index.js");

const Op = db.Sequelize.Op;
const Sessions = db.sessions;
const uploadDir = process.env.UPLOADS_DIR;

module.exports.sessionManager = async () => {
    try {  
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
        console.error("sessionManager: " + err.message);
    }
}


