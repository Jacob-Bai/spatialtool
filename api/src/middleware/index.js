const multer = require('multer');
const db = require("../models/index.js");
const uploadDir = process.env.UPLOADS_DIR;

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

module.exports.upload = async (req, res, next) => {
    try {
        // validate session id before proceed
        const sessionId = req.params.id;
        const session = await Sessions.findOne({ where: { session_id: sessionId, status: "entered" } });
        if (session === 0) 
            throw new Error("Id is not valid or file uploaded already");
    } catch(err) {
        res.status(500).json({ message: "Failed uploading file" });
    } finally {
        fileUpload.any()(req, res, next);
    }
};
