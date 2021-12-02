var mongoose= require("mongoose");
var helpcampSchema = new mongoose.Schema({
	name: String,
	image: String,
	imageId: String,
	description: String,
	location: String,
	lng:Number,
	lat:Number,
	createdAt: {
		type: Date,
		default: Date.now
	},
	author :{
		name: String,
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		phone:Number,
		email:String
	},
	queries : [{
	type: mongoose.Schema.Types.ObjectId,
	ref: "Query"
}]
});
 
module.exports = mongoose.model("Helpcamp", helpcampSchema);