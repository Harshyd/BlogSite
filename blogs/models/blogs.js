var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   comments: [{author: String,content: String}],
   desc: String,
   date : String,
   creator : String
});

module.exports = mongoose.model("Blog",blogSchema);