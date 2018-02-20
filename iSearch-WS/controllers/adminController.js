//const Playlist      = require('../models/playlist');
const request = require('request'),
      cheerio = require('cheerio');

let parseHtml = (htmlDocument) => {

    const $ = cheerio.load(htmlDocument);

    //console.log($('TITLE'));

    let titleString =  $("TITLE").text();

    let songName = titleString.substr(0, titleString.indexOf("by") - 2);
    let author = titleString.substr(titleString.indexOf("by") + 3);
    let description = $("META[NAME='description']").attr("content").toString();
    //let i = 0;
    //for (let i = 0; i < $("DL > DT").length; i++) {
    //
    //}
    let songContentElement = $("DL > DT");
    //    .each(function() {
    //        console.log(this.text());
    //    });

    let documentWords = [];

    for(let i = 0; i < songContentElement.length; i++) {
        let item = songContentElement[i];

        // getting the sentence
        let sentence = item.children[item.children.length - 1].data.toLowerCase().replace(/\s+/g, ' ');

        // getting the words from a sentence
        if(sentence != null) {
            let evaluatedSentence = sentence.match(/\b(\w+)\b/g);
            documentWords.push(...(evaluatedSentence != null ? evaluatedSentence: []));
        }
    }

    // Notes To Amit: documentWords Works fine!
    // TODO: Sorting words, and keep processing words
    // TODO: Example URL: http://www.poetry-archive.com/a/the_beacon_fires.html
    // TODO: Another URL: http://www.poetry-archive.com/c/battle_of_the_baltic.html

    //console.log(`songName = ${songName}`);
    //console.log("author = " + author);
    //console.log(`description = ${description}`);


};

exports.uploadFiles = (req, res, next) => {

    let documents = req.body['documents'];

    if(documents == null) {
        res.json({error: "No documents provided"})
    }

    return new Promise((resolve, reject) => {
        request(documents[0], function (error, response, body) {
            if(error) {
                reject(error);
            }
            resolve(body);
        });
    }).then(
        (htmlDocument) => {

            let tmp = parseHtml(htmlDocument);

            res.json({success: tmp});
        },
        (error) => {
            res.json({error: error});
        });


};