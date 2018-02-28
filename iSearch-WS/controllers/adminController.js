// Dependencies
const request = require('request'),
      cheerio = require('cheerio'),
      Consts  = require('../consts');

// Models
const Documents = require('../models/documents'),
      Terms = require('../models/terms');


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

function addToIndexFile(parsedDocument, indexFile, documentId) {
    for (let i = 0; i < parsedDocument.words.length; i++) {
        indexFile.push({
            term: parsedDocument.words[i],
            documentId: documentId,
            hits: 1
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

exports.uploadFiles = (req, res, next) => {

    let documents = req.body['documents'];

    if(documents == null) {
        res.json({error: "No documents provided"})
    }

    // remove if
    if(!(documents instanceof Array)) {
        documents = new Array(documents);
    }

    let parsedDocuments = [];
    let getDocumentsPromises = documents.map(getDocument);

    Promise.all(getDocumentsPromises)
        .then((htmlDocuments) => {

            let indexFile = [];

            // let saveDocumentsPromises = htmlDocuments.map()

            new Promise((resolve, reject) => {
                for(let i = 0; i < htmlDocuments.length; i++) {

                    let parsedDocument = parseHtml(htmlDocuments[i].body);
                    parsedDocuments.push(parsedDocument);

                    // Saving in the DB
                    saveDocument(parsedDocument, htmlDocuments[i].url)
                        .then((documentId) => {
                            addToIndexFile(parsedDocument, indexFile, documentId);
                            if(i === htmlDocuments.length - 1)
                                resolve();
                        }).catch((err) => {
                            console.log(err)
                        }
                    );
                }
            }).then(() => {
                sortIndexFile(indexFile);
                removeDuplicatesAndIncrementHits(indexFile);

                let indexFileByDocument = {};
                for(let index of indexFile) {
                    if(indexFileByDocument[index.documentId] == null) {
                        indexFileByDocument[index.documentId] = [];
                    }
                    indexFileByDocument[index.documentId].push({term: index.term, hits: index.hits});
                }

                console.log("index length = " + indexFile.length);
                for(let documentId of Object.keys(indexFileByDocument)) {

                    for(let i = 0; i < indexFileByDocument[documentId].length; i++) {

                        new Promise((resolve, reject) => {

                            let wordObj = indexFileByDocument[documentId][i];

                            Terms.findOneAndUpdate(
                                {word: wordObj.term},
                                {$push: {locations: {document: documentId, hits: wordObj.hits}}},
                                {upsert: false},
                                function (error, result) {
                                    if (error) {
                                        console.log(`err: ${err}`);
                                        //resolve(documentId);
                                    }
                                    else {
                                        if (result == null) {
                                            let termToSave = {
                                                word: wordObj.term,
                                                locations: [
                                                    {
                                                        document: documentId,
                                                        hits: wordObj.hits
                                                    }
                                                ]
                                            };
                                            Terms.update({word: termToSave.word}, {$push: {locations: termToSave.locations}}, {upsert: true},
                                                (err, data) => {
                                                    if (err) {
                                                        console.log(`err: ${err}`);
                                                    }
                                                    else {
                                                        // console.log(data) // data is the updated document saved in DB
                                                    }
                                                    resolve(documentId);
                                                }
                                            )
                                        }
                                        else {
                                            //console.log(wordObj.term + " duplcate");
                                            resolve(documentId);
                                        }
                                        //console.log("i = "+ i +"\n word = " + wordObj.term);
                                    }
                                }
                            );
                        }).then((documentId) => {
                            //i++;
                            // console.log("i = "+ i);
                            // console.log("resolved - " + documentId);
                        })
                    }
                }
            }).catch(function(err) {
                console.log(err);
            });

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

exports.toggleFile = (req, res, next) => {
    let documentId = req.body['documentId'];
    let active = req.body['active'];

    Documents.update({_id: documentId}, {isActive: active},
        (err) => {
            if(err) {
                console.log(`err: ${err}`);
                res.status(500).json({"error": "internal server error, save playlist failed"});
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