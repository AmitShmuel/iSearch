// Dependencies
const request = require('request'),
      cheerio = require('cheerio'),
      Consts  = require('../consts'),
      Soundex = require('../bl/soundex'),
      Stemmer = require("en-stemmer");

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');


function getDocument(document) {

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
}

function parseHtml(htmlDocument) {

    const $ = cheerio.load(htmlDocument);

    let document = {};
    document.title =  $("TITLE").text();
    document.songName = document.title.substr(0, document.title.indexOf("by") - 2);
    document.author = document.title.substr(document.title.indexOf("by") + 3);
    document.description = $("META[NAME='description']").attr("content").toString();

    let songContentElement = $("DL > DT");

    document.contentDescription = "";
    let currentContentDescriptionSize = 0;

    document.words = [];

    for(let i = 0; i < songContentElement.length; i++) {

        let item = songContentElement[i];

        // getting the sentence
        let sentence = item.children[item.children.length - 1].data;

        if(sentence != null) {

            // removing unnecessary characters
            let plainSentence = sentence.toLowerCase().replace(/\s+/g, ' ');

            // creating a content-description
            if(i !== 0 && currentContentDescriptionSize < Consts.DESCRIPTION_NUM_OF_ROWS) {
                currentContentDescriptionSize++;
                document.contentDescription = document.contentDescription.concat(sentence.replace(/\s+/g, ' ')+"\n");
            }

            // getting the words from a sentence
            let wordsInSentence = plainSentence.match(/\b(\w+)\b/g);
            if(wordsInSentence != null) {
                for(let j = 0; j < wordsInSentence.length; j++) {
                    wordsInSentence[j] = Stemmer.stemmer(wordsInSentence[j]);
                }
            }
            document.words.push(...(wordsInSentence != null ? wordsInSentence : []));
        }
    }

    return document;
}

function addToIndexFile(parsedDocument, indexFile, documentId) {
    for (let i = 0; i < parsedDocument.words.length; i++) {
        indexFile.push({
            term: parsedDocument.words[i],
            documentId: documentId,
            hits: 1,
            soundexCode: Soundex.generateCode(parsedDocument.words[i]),
        });
    }
}

function sortIndexFile(indexFile) {
    indexFile.sort((a, b) => {

        if (a.term !== b.term) {
            return (a.term < b.term) ? -1 : 1;
        }
        else {
            return (a.documentId < b.documentId) ? -1 : (a.documentId > b.documentId) ? 1 : 0;
        }
    });
}

function removeDuplicatesAndIncrementHits(indexFile) {
    for (let i = 0; i < indexFile.length - 1; i++) {
        let hits = 1;
        let j = i + 1;
        while (indexFile[j] != null && indexFile[i].term === indexFile[j].term && indexFile[i].documentId === indexFile[j].documentId) {
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
        contentDescription: parsedDocument.contentDescription,
        songName: parsedDocument.songName,
        title: parsedDocument.title,
        isActive: true, // When document upload - it will be active by default
        url: url,
    };

    return new Promise((resolve, reject) => {

        new Documents(documentToSave).save(
            (err, data) => {
                if (err) {
                    reject(`err: ${err}`);
                }
                else {
                    resolve(data._id); // data is the updated document saved in DB
                }
            }
        );
    });
}

function saveTerm(wordObj, documentId) {

    return new Promise((resolve, reject) => {

        Terms.findOneAndUpdate(
            {word: wordObj.term, soundexCode: wordObj.soundexCode},
            {$push: {locations: {document: documentId, hits: wordObj.hits}}},
            {upsert: true}
        )
        .then(result => resolve())
        .catch(err => reject(err))
    });
}

function createIndexFileByDocument(indexFile) {
    let indexFileByDocument = {};
    for (let index of indexFile) {
        if (indexFileByDocument[index.documentId] == null) {
            indexFileByDocument[index.documentId] = [];
        }
        let indexObj = {
            term: index.term,
            soundexCode: index.soundexCode,
            hits: index.hits,
        };
        indexFileByDocument[index.documentId].push(indexObj);
    }
    return indexFileByDocument;
}

function getExistedDocuments(documents) {

    return new Promise((resolve, reject) => {
        let counter = 0,
            docsToRemoveIndexes = [];
        for (let i = 0; i < documents.length; i++) {
            Documents.findOne({url: documents[i]},
                function(err, res) {
                    if(err) {
                        reject("error in getExistedDocuments");
                    }
                    else {
                        if(res) { // document is in db
                            docsToRemoveIndexes.push(i);
                        }
                    }
                    if(++counter === documents.length) {
                        resolve(docsToRemoveIndexes);
                    }
                }
            );
        }
    });
}

function removeExistedDocuments(docsToRemoveIndexes, documents) {
    docsToRemoveIndexes.sort((a, b) => {
        return a - b
    });
    for (let i = docsToRemoveIndexes.length - 1; i >= 0; i--) {
        documents.splice(docsToRemoveIndexes[i], 1);
    }
}

exports.uploadFiles = (req, res, next) => {

    let documents = req.body['documents'];

    if(documents == null) {
        res.status(400).json("No documents provided")
    }

    getExistedDocuments(documents).then((docsToRemoveIndexes) => {

        removeExistedDocuments(docsToRemoveIndexes, documents);

        let parsedDocuments = [];
        let getDocumentsPromises = documents.map(getDocument);

        Promise.all(getDocumentsPromises).then((htmlDocuments) => {

            let indexFile = [];
            new Promise((resolve, reject) => {
                let counter = 0;
                for(let i = 0; i < htmlDocuments.length; i++) {

                    let parsedDocument = parseHtml(htmlDocuments[i].body);
                    parsedDocuments.push(parsedDocument);

                    saveDocument(parsedDocument, htmlDocuments[i].url).then((documentId) => {

                        addToIndexFile(parsedDocument, indexFile, documentId);
                        if(++counter === htmlDocuments.length) resolve();

                    }).catch((err) => {console.log(err)});
                }
            }).then(() => {

                sortIndexFile(indexFile);

                removeDuplicatesAndIncrementHits(indexFile);

                let indexFileByDocument = createIndexFileByDocument(indexFile);

                for(let documentId of Object.keys(indexFileByDocument)) {

                    let saveTermPromises = [];
                    indexFileByDocument[documentId].forEach(
                        obj => saveTermPromises.push(
                            saveTerm(obj, documentId)
                        )
                    );

                    Promise.all(saveTermPromises)
                    .then()
                    .catch()
                }
            }).catch(function(err) {
                console.log(err);
            });

            res.json({success: "Some temporary success msg"});
        });
    })
    .catch((err) => {console.log(err)});
};


exports.getFiles = (req, res, next) => {
    Documents.find()
        .then( (documents) => {
            res.status(200).json(documents);
        })
        .catch( (err) => {
            res.status(500).json("Get Documents Error");
        });
};

exports.toggleFile = (req, res, next) => {
    let documentId = req.body['documentId'];
    let active = req.body['active'];

    Documents.update({_id: documentId}, {isActive: active},
        (err) => {
            if(err) {
                console.log(`err: ${err}`);
                res.status(500).json("Save Document failed");
            }
            else {
                res.status(201).json();
            }
    });
};

exports.getToken = (req, res, next) => {
    let password = req.body['password'];
    if(password === Consts.PASSWORD) {
        res.status(201).json({"token": "321321"});
    }
    else {
        res.status(401).json("Password is not correct");
    }
};