// Dependencies
const Consts  = require('../consts');

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');

exports.search = (req, res, next) => {

    // Getting the query search string
    let querySearch = req.query['querySearch'];

    //TODO: Deep Dive into Searching Algorithm...

    res.json("Search Works");
};