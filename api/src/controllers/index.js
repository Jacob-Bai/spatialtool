const crypto = require('crypto');
const db = require("../models/index.js");
const Sessions = db.sessions;
const Op = db.Sequelize.Op;

// minutes
const sessionExp = process.env.SESSION_EXP;

const newSession = (req, res) => {
    const sessionID = crypto.randomBytes(8).toString("hex");
    const session = {
      session_id: sessionID,
      status: "entered"
    };

    Sessions.create(session)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        res.status(500).json({
          message: err.message || "Some error occurred while creating new session."
        });
      });
};

const sessionStatus = (req, res) => {
};

module.exports = {newSession};
