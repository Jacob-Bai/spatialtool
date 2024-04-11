const multer = require('multer');
const db = require("../models/index.js");
const uploadDir = process.env.UPLOADS_DIR;

const Sessions = db.sessions;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // use sessionId as filename
        console.log("filename:"+req.params.id);
        cb(null, req.params.id);
    }
});

const fileUpload = multer({ storage });

module.exports.upload = async (req, res, next) => {
    try {
        // validate session id before proceed
        const sessionId = req.params.id;
        const row = await Sessions.update({ 
            status: "uploading" }, {
            where: { session_id: sessionId, status: "entered" } });

        if (row === 0) 
            throw new Error("Id is not valid or file uploaded already");

        fileUpload.single(sessionId)(req, res, next);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: "Failed uploading file" });
    };
};
