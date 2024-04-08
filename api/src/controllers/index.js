const crypto = require('crypto');
const fs = require('fs');
const db = require("../models/index.js");

const Sessions = db.sessions;
const uploadDir = '/tmp/app_uploads/';

module.exports.newId = (req, res) => {
    const sessionId = crypto.randomBytes(8).toString("hex");

    Sessions.create({
        session_id: sessionId,
        status: "entered"
    })
    .then(data => {
        res.json(data);
    })
    .catch(err => {
        res.status(500).json({
            message: err.message || "Some error occurred while creating new session id."
        });
    });
};

module.exports.idStatus = (req, res) => {
    res.status(500).json({
        message: "Service not available"
    });
};

module.exports.upload = (req, res) => {
    const sessionId = req.params.id;

    Sessions.update(
        { status: "uploaded" },
        { where: { session_id: sessionId }}
    )
    .then(data => {
        res.json(data);
    })
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
