const crypto = require('crypto');
const fs = require('fs');
const db = require("../models/index.js");

const Sessions = db.sessions;
const uploadDir = process.env.UPLOADS_DIR;

module.exports.newId = async (req, res) => {
    try {
        if (!req.body.file_name || !req.body.file_format) {
            throw new Error("File name or format is missing.");
        }

        // TODO: replace number with env or config
        const fileName = req.body.file_name.trim().substring(0, 100);
        const fileFormat = req.body.file_format.trim().toLowerCase();
        if (fileName === "" || fileFormat === "") {
            throw new Error("File name or format is empty.");
        }

        if (fileFormat !== "avi" && fileFormat !== "mp4") {
            throw new Error("File format not supported.");
        }

        const sessionId = crypto.randomBytes(8).toString("hex");
        await Sessions.create({
            session_id: sessionId,
            file_name: fileName,
            file_format: fileFormat,
            status: "entered"
        });
        res.json({ id: sessionId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed getting new session id." });
    };
};

module.exports.idStatus = async (req, res) => {
    try {
        const sessionId = req.query.id;
        const session = await Sessions.findOne({ where: { session_id: sessionId } });
        if (session)
            res.json({ status: session.status });
        else
            throw new Error("Id status not valid.");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed getting session id status." });
    };
};

module.exports.delete = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const row = await Sessions.update({ 
                status: "converted" }, {
                where: { session_id: sessionId } 
            })
        if (row === 0)
            throw new Error("File not uploaded or converted yet.");
        
        fs.unlink(uploadDir + sessionId, (err) => err && console.error(err));
        await db.closeSession(sessionId);
        res.json({ status: "deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed deleting file." });
    }; 
}

module.exports.upload = async (req, res) => {
    try {
        if (!req.file)
            throw new Error("File not received.");

        const sessionId = req.params.id;
        const row = await Sessions.update({ 
                status: "uploaded" }, {
                where: { session_id: sessionId } 
            })
        if (row === 0)
            throw new Error("Id status updating failed.");
        
        res.json({ status: "uploaded" });
    } catch (err) {
        fs.unlink(uploadDir + req.params.id, (err) => err && console.error(err));
        console.error(err);
        res.status(500).json({ message: "Failed uploading file." });
    };
};
