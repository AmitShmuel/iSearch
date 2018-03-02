// Dependencies
const StopList = require('../data/stoplist'),
      Soundex = require('../bl/soundex'),
      Stemmer = require('en-stemmer');

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
};

let cleanQuerySearch = (querySearch) => {

    let originalQuerySearch = querySearch;

    // LowerCase && remove double spaces
    querySearch = querySearch.toLowerCase().replace(/\s+/g, ' ');

    let wordsOnly = querySearch.match(/\b(\w+)\b/g);

    // Clear words which belong to StopList && is not between " "
    wordsOnly = wordsOnly.filter( w =>
        !( StopList.indexOf(w) > -1 && !isBetweenQuotationMarks(w, originalQuerySearch)) );

    // Stemming the words
    for(let i = 0; i < wordsOnly.length; i++) {
        wordsOnly[i] = Stemmer.stemmer(wordsOnly[i]);
    }

    return wordsOnly;
};

let generateSoundexCodes = (words) => {
    let arrayOfSoundexCodes = [];
    for(let word of words) {
        arrayOfSoundexCodes.push(Soundex.generateCode(word));
    }
    return arrayOfSoundexCodes;
};

exports.search = (req, res, next) => {

    // Getting the query search string
    let querySearch = req.query['querySearch'];
    let isSoundexActivated = req.query['soundex'] === 'true'; // Javascript is pretty stupid

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

    // Clean the query search - lowercase, empty spaces, special characters, Stop list, Stemming
    let arrayOfWords = cleanQuerySearch(querySearch);
    let arrayOfSoundexCodes = generateSoundexCodes(arrayOfWords);

    let whereObject = {
        $or: [
            {'word': {$in: arrayOfWords}},
        ],
    };

    if(isSoundexActivated) {
        whereObject.$or.push({'soundexCode': {$in: arrayOfSoundexCodes}});
    }

    Terms.find(whereObject)
         .populate({path: 'locations.document', model: Documents})
         .then((docs) => {
            // docs => words from DB which is in the QuerySearch + Documents with FULL DATA
            let documents = {}; // Key => ID of the document, Value => The Document with full data
            for(let word of docs) {
                for(let location of word._doc.locations) {
                    documents[location._doc.document._doc._id] = location._doc.document._doc
                }
            }

            // Clearing disabled documents
            let documentsArray = Object.values(documents).filter(doc => doc.isActive);

            res.json(documentsArray);
        });
};