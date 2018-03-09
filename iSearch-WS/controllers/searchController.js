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

 isQuotationMarksBalanced = (text) => {

    let isBalanced = true;

    for(let i = 0; i < text.length; i++) {
        if(text[i] === '\"') {
            isBalanced = !isBalanced;
        }
    }
    return isBalanced;
};

let isParenthesesBalanced = (text) => {

    let counter = 0;

    for(let i = 0; i < text.length; i++) {
        if(text[i] === Consts.OPEN_PARENTHESES) {
            counter++;
        }
        if(text[i] === Consts.CLOSE_PARENTHESES) {
            counter--;
        }
        if(counter < 0) return false;
    }
    return counter === 0;
};

let removeRedundantOperators = (text) => {
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

        let condition = (text[index + 1] !== '(' && text[index + 1] !== '"' && !isLetter(text[index + 1]))
            && (text[index + 2] !== '(' && text[index + 2] !== '"' && !isLetter(text[index + 2]));

        condition = operand === Consts.NOT_SIGN ?
            condition :
            condition || ( ( text[index - 1] !== ')' && text[index - 1] !== '"' && !isLetter(text[index - 1]) )
            && ( text[index - 2] !== ')' && text[index - 2] !== '"' && !isLetter(text[index - 2]) ) );

        if(condition) return false;

        index++;
    }
    return true;
};


let isOperatorsCorrect = (text) => {

    let tmpText = lowerCaseAndRemoveDoubleSpaces(text);
    tmpText = removeRedundantOperators(tmpText);

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

let isBetweenParentheses = (querySearch, operatorPosition) => {
    let index = 0;
    for(let i = 0; i < operatorPosition+1; i++) {

        let notIndex = querySearch.indexOf('!', index);
        let andIndex = querySearch.indexOf('&', index);
        let orIndex = querySearch.indexOf('|', index);
        if(notIndex === -1) notIndex = 1000;
        if(andIndex === -1) andIndex = 1000;
        if(orIndex === -1) orIndex = 1000;
        index = Math.min(notIndex, andIndex, orIndex);
        index++;
    }

    let hasStartingParentheses = 0;

    for(let i = 0; i < index-1; i++) {
        if(querySearch[i] === Consts.OPEN_PARENTHESES) {
            hasStartingParentheses++;
        }
        if(querySearch[i] === Consts.CLOSE_PARENTHESES) {
            hasStartingParentheses--;
        }
    }

    return hasStartingParentheses > 0;
};

let cleanQuerySearch = (querySearch) => {

    let originalQuerySearch = querySearch;

    // LowerCase && remove double spaces
    querySearch = lowerCaseAndRemoveDoubleSpaces(querySearch);

    querySearch = removeRedundantOperators(querySearch);

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
                expression.isInsideParentheses = isBetweenParentheses(querySearch, i);

                expressions.push(expression);
            }
        }

        // Clear words which belong to StopList && is not between " "
        wordsOnly = wordsOnly.filter( w =>
            !( StopList.indexOf(w) > -1 && !isBetweenQuotationMarks(w, originalQuerySearch)) );

        expressions = expressions.filter( e =>
            ( wordsOnly.indexOf(e.rightHand) > -1) &&
            ( wordsOnly.indexOf(e.leftHand) > -1) );
    }

    return {
        words: wordsOnly,
        expressions: expressions
    }
};

let generateSoundexCodes = (words) => {
    let arrayOfSoundexCodes = [];
    for(let word of words) {
        arrayOfSoundexCodes.push(Soundex.generateCode(word));
    }
    return arrayOfSoundexCodes;
};

let evaluateExpressions = (withParentheses, expressions, operator, setOperation, resultDocuments, docsByWord) => {

    let evaluateCondition;
    for (let i = 0; i < expressions.length; i++) {

        evaluateCondition = expressions[i].operator === operator;

        if(withParentheses) {
            evaluateCondition &= expressions[i].isInsideParentheses;
        }
        if (evaluateCondition) {

            // On the first time, the docs are retrieved from the word in leftHand/rightHand
            if (!('leftHandDocs' in expressions[i])) {
                expressions[i].leftHandDocs = docsByWord[expressions[i].leftHand];
            }
            if (!('rightHandDocs' in expressions[i])) {
                expressions[i].rightHandDocs = docsByWord[expressions[i].rightHand];
            }

            // Evaluate the expression with the relevant operation (intersection, union or difference)
            resultDocuments = setOperation(expressions[i].leftHandDocs, expressions[i].rightHandDocs);

            // populating neighbour expressions with our new results
            if (i - 1 >= 0) {
                expressions[i - 1].rightHandDocs = resultDocuments;
            }
            if (i + 1 < expressions.length) {
                expressions[i + 1].leftHandDocs = resultDocuments;
            }

            // Splicing evaluated expressions, OR is evaluated last so there is no need for splice
            if(operator !== Consts.OR_SIGN || withParentheses) {
                expressions.splice(i, 1);
                i--;
            }
        }
    }

    return resultDocuments;
};

let evaluateAllExpressions = (withParentheses, resultDocuments, expressions, docsByWord) => {

    // Evaluate NOT
    resultDocuments = evaluateExpressions(withParentheses, expressions, Consts.NOT_SIGN, _.difference, resultDocuments, docsByWord);
    // Evaluate AND
    resultDocuments = evaluateExpressions(withParentheses, expressions, Consts.AND_SIGN, _.intersection, resultDocuments, docsByWord);
    // Evaluate OR
    resultDocuments = evaluateExpressions(withParentheses, expressions, Consts.OR_SIGN, _.union, resultDocuments, docsByWord);

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
        res.status(500).json("Quotation Marks are not balanced");
        return;
    }

    // Check Parentheses is balanced
    if(!isParenthesesBalanced(querySearch)) {
        res.status(500).json("Parentheses are not balanced");
        return;
    }
    // Check if there are parentheses
    let isQueryWithParentheses = querySearch.match(/\(|\)/g) != null;

    // Check Operators are correct
    if(!isOperatorsCorrect(querySearch)) {
        res.status(500).json("Operators are not correct");
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

                // Evaluate Parentheses
                if(isQueryWithParentheses) {
                    resultDocuments = evaluateAllExpressions(true, resultDocuments, expressions, docsByWord);
                }
                resultDocuments = evaluateAllExpressions(false, resultDocuments, expressions, docsByWord);
            }

            resultDocuments = Object.values(resultDocuments).filter(doc => doc.isActive);
            res.json(resultDocuments);
        });
};