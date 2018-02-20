const express = require('express'),
      router = express.Router(),
      adminController = require('../controllers/adminController');

//upload files to system
router.post('/uploadFiles', adminController.uploadFiles);


module.exports = router;