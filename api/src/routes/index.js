var router = require('express').Router();

const api = require('../controllers/index.js');
const mid = require('../middleware/index.js');

// .com/id
router.get('/id', api.newId);
// .com/status?id=...
router.get('/status', api.idStatus);
// .com/delete/:id
//router.delete('/delete/:id', api.delete);
// .com/upload/:id
router.post('/upload/:id', mid.upload, api.upload);
// .com/download?id=...
//router.get('/download', api.download);

module.exports = router;
