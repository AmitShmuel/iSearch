//const Playlist      = require('../models/playlist');
const request = require('request'),
      cheerio = require('cheerio');

let getDocument = function (document){

    return new Promise((resolve, reject) => {
        request(document, function (error, response, body) {
            if(error) {
                reject(error);
            }
            resolve(body);
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

            for(let i = 0; i < htmlDocuments.length; i++) {

                let parsedDocument = parseHtml(htmlDocuments[i]);
                parsedDocuments.push(parsedDocument);

                // TODO insert each document to the Documents collection
            }

            console.log(parsedDocuments.length);
            //TODO create a Term,Doc.# object

            //TODO sort

            //TODO create a Term,Doc ID,Hits object

            /*TODO insert each term to the index file collection
                1. insert term
                2. increment # of docs
                3. insert Location
                    3.1 insert Doc ID
                    3.2 insert Hits
                    3.3 Occurrences?
             */
        }
    );
};

