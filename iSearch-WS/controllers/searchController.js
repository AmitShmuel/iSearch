// Dependencies
const Consts  = require('../consts');

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');

let cleanQuerySearch = (querySearch) => {

    // LowerCase the querySearch
    querySearch = querySearch.toLowerCase();

    // remove double spaces
    querySearch = querySearch.replace(/ +(?= )/g,'');

    return querySearch;
};

exports.search = (req, res, next) => {

    // Getting the query search string
    let querySearch = req.query['querySearch'];

    // Clean the query search
    querySearch = cleanQuerySearch(querySearch);

    let arrayOfWords = querySearch.split(" ");

    Terms.find({'word': {$in: arrayOfWords}})
        .then( (words) => {
           console.log(words);  // words from DB which is in the QuerySearch
        });


    //TODO: Deep Dive into Searching Algorithm...


    res.json("Search Works");
};