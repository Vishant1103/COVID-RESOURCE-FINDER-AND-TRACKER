var mongoose = require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var userSchema =mongoose.Schema({
	username: {type: String, unique:true},
	password: String,
	firstname: String,
	lastname: String,
	email: {type: String, unique:true},
	address: String,
	phone: Number,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);