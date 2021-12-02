var Helpcamp= require("../models/campgrounds");
var Query= require("../models/comments");
var middlewareObj={};

middlewareObj.checkOwner = function(req, res, next){
	if(req.isAuthenticated()){
		Helpcamp.findById(req.params.id, function(err, foundHelpcamp){
			 if(err)
				 res.redirect("back");
			 else{
				 if((foundHelpcamp.author.id).equals(req.user._id)){
					 next();
				 }
				 else
					 res.redirect("back");
			 }
		 })
	}
	else {
	 req.flash("error", "Log In Required");
		res.redirect("back");
	}
}


middlewareObj.checkOwnerQuery= function(req, res, next){
	if(req.isAuthenticated()){
		Query.findById(req.params.query_id, function(err, foundQuery){
			 if(err)
				 res.redirect("back");
			 else{
				 if((foundQuery.author.id).equals(req.user._id)){
					 next();
				 }
				 else
					 res.redirect("back");
			 }
		 })
	}
	else {
	 req.flash("error", "Log In Required");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn =function(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}
req.flash("error", "Log In Required");
		res.redirect("/login")
}

module.exports=middlewareObj;


