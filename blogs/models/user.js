var mongoose = require("mongoose");
var plm = require("passport-local-mongoose");
var passport = require("passport");

var userSchema = new mongoose.Schema({
	username : String,
	password : String,
	name : String
});

userSchema.plugin(plm);

module.exports = mongoose.model("User",userSchema);