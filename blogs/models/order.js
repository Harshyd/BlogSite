var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var orderschema = new mongoose.Schema({
    seller:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    buyer:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: String,
    item:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    date: String,
    address: String,
    contact: String
});

orderschema.plugin(deepPopulate);
module.exports = mongoose.model('Order',orderschema);