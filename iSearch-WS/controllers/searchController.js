// Dependencies
const StopList = require('../data/stoplist'),
      Soundex = require('../bl/soundex'),
      Stemmer = require('en-stemmer'),
      Consts  = require('../consts'),
      isLetter = require('is-letter'),
      _ = require('lodash');

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');

let lowerCaseAndRemoveDoubleSpaces = (text) => text.toLowerCase().replace(/\s+/g, ' ');

let unionArrays = (x, y) => {
    let obj = {};
    for (let i = x.length-1; i >= 0; -- i)
        obj[x[i]] = x[i];
    for (let i = y.length-1; i >= 0; -- i)
        obj[y[i]] = y[i];
    let res = [];
    for (let k in obj) {
        if (obj.hasOwnProperty(k))  // <-- optional
            res.push(obj[k]);
    }
    return res;
};

//TODO: not support ""
let isQuotationMarksBalanced = (text) => {

    let isBalanced = true;

    for(let i = 0; i < text.length; i++) {
        if(text[i] === '\"') {
            isBalanced = !isBalanced;
        }
    }
    return isBalanced;
};

let removeReduntdantOperators = (text) => {
    let index = 0;
    while((index = text.indexOf(Consts.AND_SIGN, index)) !== -1) {
        let isNotOperandAfterAnd = text[index + 1] === Consts.NOT_SIGN || text[index + 2] === Consts.NOT_SIGN;
        if(isNotOperandAfterAnd) {
            text = text.substr(0, index) + text.substr(index).replace(Consts.AND_SIGN, '');
        }
        index++;
    }
    return text;
};

let checkOperand = (text, operand) => {

    let index = 0;
    while((index = text.indexOf(operand, index)) !== -1) {

        let condition = (text[index + 1] !== '"' && !isLetter(text[index + 1]))
            && (text[index + 2] !== '"' && !isLetter(text[index + 2]));

        condition = operand === Consts.NOT_SIGN ?
            condition :
            condition || ( ( text[index - 1] !== '"' && !isLetter(text[index - 1]) )
            && ( text[index - 2] !== '"' && !isLetter(text[index - 2]) ) );

        if(condition) return false;

        index++;
    }
    return true;
};


let isOperandsCorrect = (text) => {

    let tmpText = lowerCaseAndRemoveDoubleSpaces(text);
    tmpText = removeReduntdantOperators(tmpText);

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

    querySearch = removeReduntdantOperators(querySearch);


    let expressions = [];
    let wordsOnly = querySearch.match(/\b(\w+)\b/g);
    let operatorsOnly = querySearch.match(/&|!|(\|)/g);

    if(wordsOnly != null) {
        // Stemming the words
        for(let i = 0; i < wordsOnly.length; i++) {
            wordsOnly[i] = Stemmer.stemmer(wordsOnly[i]);
        }

        if(operatorsOnly != null) {
            for (let i = 0; i < operatorsOnly.length; i++) {
                let expression = {};

                expression.operator = operatorsOnly[i];
                expression.leftHand = wordsOnly[i];
                expression.rightHand = wordsOnly[i + 1];

                expressions.push(expression);
            }
        }

        // Clear words which belong to StopList && is not between " "
        wordsOnly = wordsOnly.filter( w =>
            !( StopList.indexOf(w) > -1 && !isBetweenQuotationMarks(w, originalQuerySearch)) );

        expressions = expressions.filter( e =>
            !( wordsOnly.indexOf(e.rightHandStem) > -1) );
    }

    return {
        words: wordsOnly,
        expressions: expressions
    }
    // return wordsOnly;
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
    if(!isOperandsCorrect(querySearch)) {
        res.status(500).json("Operands are not correct");
        return;
    }

    // Clean the query search - lowercase, empty spaces, special characters, Stop list, Stemming
    // let arrayOfWords = cleanQuerySearch(querySearch);
    // if(arrayOfWords == null) {
    //     res.status(500).json("Search field must contain at least one word");
    //     return;
    // }

    let queryObj = cleanQuerySearch(querySearch);
    if(queryObj.words == null) {
        res.status(500).json("Search field must contain at least one word");
        return;
    }

    let whereObject = {
        $or: [
            // {'word': {$in: arrayOfWords}},
            {'word': {$in: queryObj.words}},
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
        // let arrayOfSoundexCodes = generateSoundexCodes(arrayOfWords);
        let arrayOfSoundexCodes = generateSoundexCodes(queryObj.words);
        whereObject.$or.push({'soundexCode': {$in: arrayOfSoundexCodes}});
    }

    Terms.find(whereObject)
        .populate({path: 'locations.document', model: Documents})
        .then((words) => { // words => words from DB which is in the QuerySearch + Documents with FULL DATA

            let resultDocuments = null;

            // No Operators
            if(queryObj.expressions.length === 0) {
                let documents = {}; // Key => ID of the document, Value => The Document with full data
                for(let word of words) {
                    for(let location of word._doc.locations) {
                        let documentId = location._doc.document._doc._id;
                        if(documents[documentId] == null) {
                            documents[documentId] = location._doc.document._doc;
                        }
                    }
                }
                resultDocuments = documents;
            }

            // Operators
            else {
                let wordsObj = {};
                for(let word of words) {
                    wordsObj[word._doc.word] = [];
                    for(let location of word._doc.locations) {
                        wordsObj[word._doc.word].push(location._doc.document._doc);
                    }
                }

                //Sort NOT first, AND Second, OR Third
                queryObj.expressions = _.orderBy(queryObj.expressions, ['operator'],['asc']); // Use Lodash to sort array by 'name'


                resultDocuments = wordsObj[queryObj.expressions[0].leftHand];

                for(let i = 0; i < queryObj.expressions.length; i ++) {
                    let rightWord = queryObj.expressions[i].rightHand;
                    let docsOfRightWord = wordsObj[rightWord];

                    switch(queryObj.expressions[i].operator) {
                        case Consts.AND_SIGN:
                            resultDocuments = _.intersection(resultDocuments, docsOfRightWord);
                            break;

                        case Consts.OR_SIGN:
                            resultDocuments = _.union(resultDocuments, docsOfRightWord);
                            break;

                        case Consts.NOT_SIGN:
                            resultDocuments = _.difference(resultDocuments, docsOfRightWord);
                            break;

                        default: break;
                    }
                }
            }

            resultDocuments = Object.values(resultDocuments).filter(doc => doc.isActive);
            res.json(resultDocuments);
        });
};