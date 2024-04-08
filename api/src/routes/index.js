var router = require('express').Router();

const api = require('../controllers/index.js');

// .com/id
router.get('/id', api.newSession);
// .com/status?id=...
//router.get('/status', api.sessionStatus);
// .com/id?id=...
//router.delete('/id', api.closeSession);
// .com/video?id=...
//router.post('/video', api.uploadVideo);
// .com/video?id=...
//router.get('/video', api.downloadVideo);

module.exports = router;
