var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   seller: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
   },
   comments: [{author: String,content: String}],
   desc: String,
   price: Number,
});
blogSchema.plugin(deepPopulate);
module.exports = mongoose.model("Blog",blogSchema);