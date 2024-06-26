const crypto = require('crypto');
const fs = require('fs');
const db = require("../models/index.js");
const managers = require("../managers/index.js");

const Sessions = db.sessions;
const uploadDir = process.env.UPLOADS_DIR;

module.exports.newId = async (req, res) => {
    try {

        const sessionId = crypto.randomBytes(8).toString("hex");
        await Sessions.create({
            session_id: sessionId,
            status: "entered" 
        });
            
        res.json({ id: sessionId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ id: 0 });
    };
};

module.exports.idStatus = async (req, res) => {
    try {
        const sessionId = req.query.id;
        const session = await Sessions.findOne({ where: { session_id: sessionId } });
        if (session) {
            res.json({ 
                status: session.status,
                filename: session.status === "converted" ? session.file_name : "" });
        } else {
            throw new Error("Id status not valid.");
        }
    } catch (err) {
        console.error(err);
        res.json({ status: "closed" });
    };
};

module.exports.delete = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await Sessions.findOne({ 
            where: { 
                session_id: sessionId, 
                status: "converted" 
            } 
        });

        if (!session) {
            throw new Error("File not converted yet.");
        }

        fs.unlink(uploadDir + sessionId, (err) => err && console.error(err));
        await db.closeSession(sessionId);
        res.json({ status: "deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "failed" });
    }; 
}

module.exports.upload = async (req, res) => {
    try {
        const sessionId = req.params.id;
        if (!req.file) {
            await Sessions.update({ 
                status: "entered" }, {
                where: { session_id: sessionId } 
            });
            throw new Error("File not received.");
        }

        const row = await Sessions.update({ 
            status: "uploaded",
            file_name: "spatial-" + req.file.originalname,
            file_format: req.file.mimetype.replace("video/", "") 
        }, {
            where: { session_id: sessionId } 
        });

        if (!row[0]) {
            throw new Error("Id status updating failed.");
        }

        managers.fileConverter(sessionId);
        res.json({ status: "converting" });
    } catch (err) {
        fs.unlink(uploadDir + req.params.id, (err) => err && console.error(err));
        console.error(err);
        res.status(500).json({ status: "failed" });
    };
};

module.exports.download = async (req, res) => {
    try {
        const sessionId = req.query.id;
        const [row, session] = await Sessions.update({ 
            status: "downloading" }, {
            where: { session_id: sessionId, status: "converted" },
            returning: true 
        });

        if (!row[0]) {
            throw new Error("Id not ready for download.");
        }

        if (!fs.existsSync(uploadDir + sessionId)) {
            db.closeSession(sessionId);
            throw new Error("File not exist");
        }

        res.download(
            uploadDir + sessionId, 
            session.file_name + '.' + session.file_format, 
            (err) => { 
                if (err) {
                    console.error(err);
                    // roll back
                    Sessions.update({ 
                        status: "converted" },{
                        where: { session_id: sessionId } });
                } else {
                    fs.unlink(uploadDir + req.params.id, (err) => err && console.error(err));
                    db.closeSession(sessionId);
                } 
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "failed" });
    }
}
