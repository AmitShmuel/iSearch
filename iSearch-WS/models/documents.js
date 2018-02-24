const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const documentSchema = new Schema({
    author: {type: String, required: true},
    description: {type: String, required: true},
    songName: {type: String, required: true},
    title: {type: String, required: true},
    isActive: {type: Boolean, required: true},
}, {collection: 'documents'});

module.exports = mongoose.model('Documents',documentSchema);