// Dependencies
const Consts  = require('../consts'),
      StopList = require('../data/stoplist');

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');

let isQuotationMarksBalanced = (text) => {

    let isBalanced = true;

    for(let i = 0; i < text.length; i++) {
        if(text[i] === '\"') {
            isBalanced = !isBalanced;
        }
    }
    return isBalanced;
};

let isBetweenQuotationMarks = (word, text) => {

    let indexOfWord = text.indexOf(word);

    let hasStartingQuatationMarks = false;

    for(let i = 0; i < indexOfWord; i++) {
        if(text[i] === '\"') {
            hasStartingQuatationMarks = !hasStartingQuatationMarks;
        }
    }
    return hasStartingQuatationMarks;

    //let startQuatationMarks = text.indexOf("\""),
    //    endQuotationMarks = text.indexOf("\"", startQuatationMarks + 1);
    //
    //if(startQuatationMarks < indexOfWord && endQuotationMarks > indexOfWord) {
    //    return true;
    //}
    //return false;
};

let cleanQuerySearch = (querySearch) => {

    let originalQuerySearch = querySearch;

    // LowerCase && remove double spaces
    querySearch = querySearch.toLowerCase().replace(/\s+/g, ' ');

    let wordsOnly = querySearch.match(/\b(\w+)\b/g);

    // Clear words which belong to StopList && is not between " "
    wordsOnly = wordsOnly.filter( w =>
        !( StopList.indexOf(w) > -1 && !isBetweenQuotationMarks(w, originalQuerySearch)) );

    return wordsOnly;
};

exports.search = (req, res, next) => {

    // Getting the query search string
    let querySearch = req.query['querySearch'];

    // Check querySearch is not null and not empty
    if(querySearch === null ||querySearch.length === 0 || !querySearch.trim()) {
        res.status(500).json("Search field cannot be empty");
        return;
    }

    // Check QuotationMarks is balanced
    if(!isQuotationMarksBalanced(querySearch)) {
        res.status(500).json("Quotation Marks is not balanced");
        return;
    }

    // Clean the query search - Lowercase, empty spaces, Stop list...
    let arrayOfWords = cleanQuerySearch(querySearch);

    Terms.find({'word': {$in: arrayOfWords}})
         .populate({path: 'locations.document', model: Documents})
         .then((docs) => {  //docs["0"]._doc.locations["5"]._doc.document._doc
            // docs => words from DB which is in the QuerySearch + Documents with FULL DATA
            let documents = {}; // Key => ID of the document, Value => The Document with full data
            for(let word of docs) {
                for(let location of word._doc.locations) {
                    documents[location._doc.document._doc._id] = location._doc.document._doc
                }
            }
            let documentsArray = Object.values(documents).filter(doc => doc.isActive);
            res.json(documentsArray);
        });


    //TODO: Deep Dive into Searching Algorithm...


    //res.json("Search Works");
};