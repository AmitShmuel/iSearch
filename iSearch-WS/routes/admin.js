const express = require('express'),
      router = express.Router(),
      adminController = require('../controllers/adminController');

//upload files to system
router.post('/uploadFiles', adminController.uploadFiles);

router.get('/getFiles', adminController.getFiles);

router.patch('/toggleFile', adminController.toggleFile);

router.post('/getToken', adminController.getToken);


module.exports = router;