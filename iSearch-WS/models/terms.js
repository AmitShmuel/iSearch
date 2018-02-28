const mongoose = require('mongoose'),
      uniqueValidator = require('mongoose-unique-validator');
      Schema = mongoose.Schema;

const locationSchema = new Schema({
    document: {type: Schema.Types.ObjectId, ref: 'Documents', required: true},
    hits: {type: Number, required: true}
});

const termSchema = new Schema({
    word: {type: String, required: true, unique: true},
    locations: [{type: locationSchema, required: true}],
}, {collection: 'terms'});

termSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Terms',termSchema);