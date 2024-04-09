const multer = require('multer');
const fs = require('fs');
const db = require("../models/index.js");
const uploadDir = '/tmp/app_uploads/';

const Sessions = db.sessions;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filname: (req, file, cb) => {
        // use sessionId as filename
        cb(null, req.params.id);
    }
});

const fileUpload = multer({ storage });

module.exports.upload = (req, res, next) => {
    // validate session id before proceed
    const sessionId = req.params.id;
    Sessions.findOne({
        where: {
            session_id: sessionId,
            status: "entered"
         }
    })
    .then(found => {
        if (found) {
            fileUpload.any()(req, res, next)
        } else
            res.status(500).json({
                message: "Id is not valid or file uploaded already"
            });
    })
    .catch(err => {
        res.status(500).json({
            message: err.message || "Something wrong when validating session id"
        });
    });
};
