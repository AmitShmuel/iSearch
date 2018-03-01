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
         .populate({path: 'locations.document', model: Documents})
         .then((docs) => {  //docs["0"]._doc.locations["5"]._doc.document._doc
            // docs => words from DB which is in the QuerySearch + Documents with FULL DATA
            console.log(docs);
            let documents = {}; // Key => ID of the document, Value => The Document with full data
            for(let word of docs) {
                for(let location of word._doc.locations) {
                    documents[location._doc.document._doc._id] = location._doc.document._doc
                }
            }
            console.log(documents);
            res.json(Object.values(documents));
        });


    //TODO: Deep Dive into Searching Algorithm...


    //res.json("Search Works");
};