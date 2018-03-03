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

    let operators = text.match(/&|!|(\|)/g);

    return operators == null
        || operators[0] !== Consts.NOT_SIGN // NOT cannot be first
        && checkOperand(tmpText, Consts.NOT_SIGN)
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

let evaluateExpressions = (expressions, operator, setOperation, resultDocuments, docsByWord) => {

    for (let i = 0; i < expressions.length; i++) {

        if (expressions[i].operator === operator) {

            if (!('leftHandDocs' in expressions[i])) {
                expressions[i].leftHandDocs = docsByWord[expressions[i].leftHand];
            }
            if (!('rightHandDocs' in expressions[i])) {
                expressions[i].rightHandDocs = docsByWord[expressions[i].rightHand];
            }

            resultDocuments = setOperation(expressions[i].leftHandDocs, expressions[i].rightHandDocs);

            if (i - 1 >= 0) {
                expressions[i - 1].rightHandDocs = resultDocuments;
            }
            if (i + 1 < expressions.length) {
                expressions[i + 1].leftHandDocs = resultDocuments;
            }

            if(operator !== Consts.OR_SIGN) expressions.splice(i, 1);
        }
    }
    return resultDocuments;
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

    let queryObj = cleanQuerySearch(querySearch);
    if(queryObj.words == null) {
        res.status(500).json("Search field must contain at least one word");
        return;
    }

    let whereObject = {
        $or: [
            {'word': {$in: queryObj.words}},
        ],
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
            // With Operators
            else {
                let docsByWord = {};
                for(let word of words) {
                    docsByWord[word._doc.word] = [];
                    for(let location of word._doc.locations) {
                        docsByWord[word._doc.word].push(location._doc.document._doc);
                    }
                }

                let expressions = queryObj.expressions;

                // evaluate NOT
                resultDocuments = evaluateExpressions(expressions, Consts.NOT_SIGN, _.difference, resultDocuments, docsByWord);
                // evaluate AND
                resultDocuments = evaluateExpressions(expressions, Consts.AND_SIGN, _.intersection, resultDocuments, docsByWord);
                // evaluate OR
                resultDocuments = evaluateExpressions(expressions, Consts.OR_SIGN, _.union, resultDocuments, docsByWord);
             }

            resultDocuments = Object.values(resultDocuments).filter(doc => doc.isActive);
            res.json(resultDocuments);
        });
};