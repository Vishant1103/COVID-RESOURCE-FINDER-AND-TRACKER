var mongoose = require("mongoose");

var querySchema = mongoose.Schema({
	text: String,
	author: {
	name: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
	id:{
	type: mongoose.Schema.Types.ObjectId,
	ref: "User"
  }  
 },
});
module.exports = mongoose.model("Query", querySchema)