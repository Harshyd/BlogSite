var mongoose = require("mongoose");
var plm = require("passport-local-mongoose");
var passport = require("passport");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var userSchema = new mongoose.Schema({
	email : String,
	username : String,
	password : String,
	name : String,
	seller: Boolean,
	buyer: Boolean,
	buyorders: [{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Order'
	}],
	sellorders: [{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Order'
	}]
});

userSchema.plugin(deepPopulate);
userSchema.plugin(plm);

module.exports = mongoose.model("User",userSchema);