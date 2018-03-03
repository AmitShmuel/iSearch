// Dependencies
const StopList = require('../data/stoplist'),
      Soundex = require('../bl/soundex'),
      Stemmer = require('en-stemmer'),
      Consts  = require('../consts'),
      isLetter = require('is-letter');

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');

let lowerCaseAndRemoveDoubleSpaces = (text) => text.toLowerCase().replace(/\s+/g, ' ');

let isQuotationMarksBalanced = (text) => {

    let isBalanced = true;

    for(let i = 0; i < text.length; i++) {
        if(text[i] === '\"') {
            isBalanced = !isBalanced;
        }
    }
    return isBalanced;
};

let checkOperand = (text, operand) => {

    let index = 0;
    while((index = text.indexOf(operand, index)) !== -1) {

        let condition = !isLetter(text[index + 1]) && !isLetter(text[index + 2]);
        condition = operand === Consts.NOT_SIGN ?
            condition :
            condition || (!isLetter(text[index - 1]) && !isLetter(text[index - 2]));

        if(condition) return false;

        index++;
    }
    return true;
};


let isOperandsIsCorrect = (text) => {

    let tmpText = lowerCaseAndRemoveDoubleSpaces(text);

    return checkOperand(tmpText, Consts.NOT_SIGN)
        && checkOperand(tmpText, Consts.OR_SIGN)
        && checkOperand(tmpText, Consts.AND_SIGN);
};

let isBetweenQuotationMarks = (word, text) => {

    let indexOfWord = text.indexOf(word);

    let hasStartingQuotationMarks = false;

    for(let i = 0; i < indexOfWord; i++) {
        if(text[i] === '\"') {
            hasStartingQuotationMarks = !hasStartingQuotationMarks;
        }
    }
    return hasStartingQuotationMarks;
};

let cleanQuerySearch = (querySearch) => {

    let originalQuerySearch = querySearch;

    // LowerCase && remove double spaces
    querySearch = lowerCaseAndRemoveDoubleSpaces(querySearch);

    let wordsOnly = querySearch.match(/\b(\w+)\b/g);

    if(wordsOnly != null) {
        // Clear words which belong to StopList && is not between " "
        wordsOnly = wordsOnly.filter( w =>
            !( StopList.indexOf(w) > -1 && !isBetweenQuotationMarks(w, originalQuerySearch)) );

        // Stemming the words
        for(let i = 0; i < wordsOnly.length; i++) {
            wordsOnly[i] = Stemmer.stemmer(wordsOnly[i]);
        }
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
    if(querySearch == null || querySearch.length === 0 || !querySearch.trim()) {
        res.status(500).json("Search field cannot be empty");
        return;
    }

    // Check QuotationMarks is balanced
    if(!isQuotationMarksBalanced(querySearch)) {
        res.status(500).json("Quotation Marks is not balanced");
        return;
    }

    // Check Operands is correct
    if(!isOperandsIsCorrect(querySearch)) {
        res.status(500).json("Operands are not correct");
        return;
    }

    // Clean the query search - lowercase, empty spaces, special characters, Stop list, Stemming
    let arrayOfWords = cleanQuerySearch(querySearch);
    if(arrayOfWords == null) {
        res.status(500).json("Search field must contain at least one word");
        return;
    }

    let whereObject = {
        $or: [
            {'word': {$in: arrayOfWords}},
        ],
        //$and: [ // Should represent the boolean operands
        //    //{'word': {$ne:'then' }}, // NOT
        //    //{
        //    //    $or: [
        //    //        {'word': {$eq: 'joy'}},
        //    //    ],
        //    //}
        //
        ////
        //],
    };

    if(isSoundexActivated) {
        let arrayOfSoundexCodes = generateSoundexCodes(arrayOfWords);
        whereObject.$or.push({'soundexCode': {$in: arrayOfSoundexCodes}});
    }

    Terms.find(whereObject)
        .populate({path: 'locations.document', model: Documents})
        .then((words) => {
            // docs => words from DB which is in the QuerySearch + Documents with FULL DATA
            let documents = {}; // Key => ID of the document, Value => The Document with full data

            for(let word of words) {
                for(let location of word._doc.locations) {
                    let documentId = location._doc.document._doc._id;
                    if(documents[documentId] == null) {
                        documents[documentId] = location._doc.document._doc;
                        //documents[documentId].words = [word._doc];
                    }
                    //else {
                        //documents[documentId].words.push(word._doc);
                    //}
                }
            }

            // Operands start here (?)
            // Start Test
            let wordsObj = {};
            for(let word of words) {
                wordsObj[word._doc.word] = [];
                for(let location of word._doc.locations) {
                    wordsObj[word._doc.word].push(location._doc.document._doc._id);
                }
            }

            

            /// End of Test

            // Clearing disabled documents
            let documentsArray = Object.values(documents).filter(doc => doc.isActive);

            // Cleaning words from documents
            //documentsArray.forEach(doc => delete doc.words );

            res.json(documentsArray);
        });
};