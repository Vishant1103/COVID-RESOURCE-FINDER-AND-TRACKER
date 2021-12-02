var express=require("express")
var router=express.Router({mergeParams: true});
var Helpcamp= require("../models/campgrounds");
var Query= require("../models/comments");
var middleware=require("../middleware");

//===============================================================
//new query form
router.get("/new",middleware.isLoggedIn, function(req, res){
	Helpcamp.findById(req.params.id, function(err,helpcamp){
		 if(err)
			 console.log(err);
		 else 
			 res.render("newcomment", {helpcamp: helpcamp});
	 });
});

//================================================================
//posting query
router.post("/",middleware.isLoggedIn, function(req, res){
	 Helpcamp.findById(req.params.id, function(err, helpcamp){
		 if(err){
			 console.log(err);
		 }
		 else {
			 Query.create(req.body.query, function(err, query){
				 if(err){
					 console.log(err);
				 }
				 else{
					 query.author.id=req.user._id;
					 query.author.name=req.user.username;
					 query.save();
					 helpcamp.queries.push(query);
					 helpcamp.save();
					 res.redirect("/helpcamps/"+helpcamp._id)
				 }
			 });
		 }
    });
});

//==================================================================================
//get edit form
router.get("/:query_id/edit", middleware.checkOwnerQuery, function(req, res){
	Query.findById(req.params.query_id, function(err, foundQuery){
		if(err)
			res.redirect("back");
		else
			res.render("editcomment", { helpcamp_id: req.params.id, foundQuery: foundQuery})
	});
});

//=================================================================================
//putting queries
router.put("/:query_id", middleware.checkOwnerQuery, function(req,res){
	Query.findByIdAndUpdate(req.params.query_id, req.body.foundQuery,function(err, editedQuery){
		if(err)
			res.redirect("back")
		else{
			req.flash("success","Edited Successfully")
			res.redirect("/helpcamps/"+ req.params.id)
		}
	});
});

//===============================================================================
//deleting query
router.delete("/:query_id", middleware.checkOwnerQuery, function(req, res){
	Query.findByIdAndRemove(req.params.query_id, function(err){
		if(err)
			res.redirect("back")
		else
			req.flash("success" ,"Deleted Successfully")
			res.redirect("/helpcamps/"+ req.params.id)
	})
})

module.exports = router;
