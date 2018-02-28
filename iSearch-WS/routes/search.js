const express = require('express'),
      router = express.Router(),
      searchController = require('../controllers/searchController');

//upload files to system
router.get('/', searchController.search);



module.exports = router;