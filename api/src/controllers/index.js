const crypto = require('crypto');
const fs = require('fs');
const db = require("../models/index.js");

const Sessions = db.sessions;
const uploadDir = '/tmp/app_uploads/';

module.exports.newId = (req, res) => {
    if (!req.body.file_name || !req.body.file_format) {
        return res.status(500).json({
            message: "File name or format is missing in request body."
        });
    }

    // TODO: replace number with env or config
    const fileName = req.body.file_name.trim().substring(0, 100);
    const fileFormat = req.body.file_format.trim().toLowerCase();

    if (fileName === "" || fileFormat === "") {
        return res.status(500).json({
            message: "File name or format is empty."
        });
    }

    if (fileFormat !== "avi" && fileFormat !== "mp4") {
        return res.status(500).json({
            message: "File format not supported."
        });
    }

    const sessionId = crypto.randomBytes(8).toString("hex");

    Sessions.create({
        session_id: sessionId,
        file_name: fileName,
        file_format: fileFormat,
        status: "entered"
    })
    .then(res.json({ status: "entered" }))
    .catch(err => {
        res.status(500).json({
            message: err.message || "Some error occurred while creating new session id."
        });
    });
};

module.exports.idStatus = (req, res) => {
    const sessionId = req.query.id;
    Sessions.findOne({ where: { session_id: sessionId }})
    .then(found => {
        if (found)
            res.json({
                status: found.status
            });
        else
            res.status(500).json({
                message: "Id is not valid."
            });
    })
    .catch(err => {
        res.status(500).json({
            message: err.message || "Something wrong when validating session id."
        });
    });
};

module.exports.upload = (req, res) => {
    if (!req.file) {
        fs.unlink(uploadDir + sessionId);
        return res.status(500).json({ message: "uploading failed" });
    }
    const sessionId = req.params.id;

    Sessions.update(
        { status: "uploaded" },
        { where: { session_id: sessionId }}
    )
    .then(res.json({ status: "uploaded" }))
    .catch(err => {
        fs.unlink(uploadDir + sessionId, (err) => {
            if (err)
                console.error('Error deleting file ' + sessionId + ' ' + err);
        });
        res.status(500).json({
            message: err.message || "Some error occurred while updating session status."
        });
    });
};
