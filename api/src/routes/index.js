var router = require('express').Router();

const api = require('../controllers/index.js');
const mid = require('../middlewares/index.js');

// .com/id
router.get('/id', api.newId);
// .com/status?id=...
router.get('/status', api.idStatus);
// .com/video/:id
router.delete('/video/:id', api.delete);
// .com/video/:id
router.post('/video/:id', mid.upload, api.upload);
// .com/download?id=...
//router.get('/download', api.download);

module.exports = router;
