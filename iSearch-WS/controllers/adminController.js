// Dependencies
const request = require('request'),
      cheerio = require('cheerio');

// Models
const Documents = require('../models/documents');


let getDocument = function (document){

    return new Promise((resolve, reject) => {
        request(document, function (error, response, body) {
            if(error) {
                reject(error);
            }
            let documentObj = {
                body: body,
                url: document
            };
            resolve(documentObj);
        })
    });
};

let parseHtml = (htmlDocument) => {

    const $ = cheerio.load(htmlDocument);

    let document = {};
    document.title =  $("TITLE").text();
    document.songName = document.title.substr(0, document.title.indexOf("by") - 2);
    document.author = document.title.substr(document.title.indexOf("by") + 3);
    document.description = $("META[NAME='description']").attr("content").toString();

    let songContentElement = $("DL > DT");

    document.words = [];

    for(let i = 0; i < songContentElement.length; i++) {

        let item = songContentElement[i];

        // getting the sentence
        let sentence = item.children[item.children.length - 1].data;

        if(sentence != null) {
            // removing unnecessary characters
            let plainSentence = sentence.toLowerCase().replace(/\s+/g, ' ');

            // getting the words from a sentence
            let wordsInSentence = plainSentence.match(/\b(\w+)\b/g);
            document.words.push(...(wordsInSentence != null ? wordsInSentence : []));
        }
    }

    return document;
};

function addToIndexFile(parsedDocument, indexFile, i) {
    for (let j = 0; j < parsedDocument.words.length; j++) {
        indexFile.push({
            term: parsedDocument.words[j],
            documentNumber: i,
            hits: 1
        });
    }
}

function sortIndexFile(indexFile) {
    indexFile.sort((a, b) => {

        if (a.term != b.term) {
            return (a.term < b.term) ? -1 : 1;
        }
        else {
            return (a.documentNumber < b.documentNumber) ? -1 : (a.documentNumber > b.documentNumber) ? 1 : 0;
        }
    });
}

function removeDuplicatesAndIncrementHits(indexFile) {
    for (let i = 0; i < indexFile.length - 1; i++) {
        let hits = 1;
        let j = i + 1;
        while (indexFile[i].term === indexFile[j].term && indexFile[i].documentNumber === indexFile[j].documentNumber) {
            hits++;
            j++;
        }
        if (hits > 1) {
            indexFile[i].hits = hits;
            indexFile.splice(i + 1, hits - 1);
        }
    }
}

function saveDocument(parsedDocument, url) {

    let documentToSave = {
        author: parsedDocument.author,
        description: parsedDocument.description,
        songName: parsedDocument.songName,
        title: parsedDocument.title,
        isActive: true, // When document upload - it will be active by default
        url: url,
    };

    new Documents(documentToSave).save(
        (err, data) => {
            console.log(data);  // data is the updated document saved in DB
            if (err) {
                console.log(`err: ${err}`);
            }
            else {
                console.log('Document Saved Successfully');
            }
        }
    )
}

exports.uploadFiles = (req, res, next) => {

    let documents = req.body['documents'];

    if(documents == null) {
        res.json({error: "No documents provided"})
    }

    if(!(documents instanceof Array)) {
        documents = new Array(documents);
    }

    let parsedDocuments = [];
    let promises = documents.map(getDocument);

    Promise.all(promises)
        .then((htmlDocuments) => {

                let indexFile = [];

                for(let i = 0; i < htmlDocuments.length; i++) {

                    let parsedDocument = parseHtml(htmlDocuments[i].body);
                    parsedDocuments.push(parsedDocument);

                    addToIndexFile(parsedDocument, indexFile, i);

                    // Saving in the DB
                    saveDocument(parsedDocument, htmlDocuments[i].url);

                }

                sortIndexFile(indexFile);

                removeDuplicatesAndIncrementHits(indexFile);

                // console.log(indexFile);

                /*TODO insert each term to the index file collection
                    1. insert term
                    2. increment # of docs
                    3. insert Location
                        3.1 insert Doc ID
                        3.2 insert Hits
                        3.3 Occurrences?
                 */

                res.json({success: "Some temporary success msg"});
            }
        );
};


exports.getFiles = (req, res, next) => {
    Documents.find()
        .then( (documents) => {
            res.status(200).json(documents);
        })
        .catch( (err) => {
            res.status(400).json({"error": `documents was not found`});
        });
};

