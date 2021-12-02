 var express=require("express")
var router=express.Router();
var Helpcamp= require("../models/campgrounds");
var middleware=require("../middleware");

//============================================
//geocoder setup
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: "9W50yKGG4JY9RC9xHX7SOcwtqPfkPYbs",
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//=====================================================
//multer&cloudinary setup
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'vishant1103', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
//=================================================
//helpcamp page
router.get("/", function(req, res){
    if(req.query.search) {
        var regex = new RegExp(escapeRegex(req.query.search), 'gi');
       		 Helpcamp.find({name: regex}, function(err, allHelpcamps){
          		 if(err){
             		  console.log(err);
          		 }
				 else {
             		 if(allHelpcamps.length < 1) {
						 var regex = new RegExp(escapeRegex(req.query.search), 'gi');
						 Helpcamp.find({location: regex}, function(err, allHelpcamps){
							 if(err){
							  console.log(err);
								 }
							 else {
							 if(allHelpcamps.length < 1) {
								 req.flash("error", "NO ORGANISATION FOUND, TRY AGAIN")
								 res.redirect("/helpcamps")
							 }
							 else
								 res.render("index",{helpcamp :allHelpcamps});
							 }
						 });
     				 }
					 else
         				 res.render("index",{helpcamp :allHelpcamps});
    				 }
       		 });
	}
	else {
		 Helpcamp.find({},function(err , allHelpcamps){
		 	 if(err)
			 	 console.log(err);
		 	 else {
			  res.render("index", {helpcamp: allHelpcamps , currentUser: req.user, page: "helpcamp"});		
		 	 }
	 	 });
	}
});

//=============================================
//new helpcamp page
router.get("/new",middleware.isLoggedIn, function(req, res){
		res.render("newcampground");
});

//===============================================
//new helpcamp post
router.post("/",middleware.isLoggedIn,upload.single('image'), function(req, res){   
	 geocoder.geocode(req.body.location, function (err, data) {
   		 if (err || !data.length) {
     		 req.flash('error', 'Invalid address');
     		 return res.redirect('back');
   		 }
   		 req.body.helpcamp.lat = data[0].latitude;
   		 req.body.helpcamp.lng = data[0].longitude;
   		 req.body.helpcamp.location = data[0].formattedAddress;
		cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
     		 if(err) {
       			 req.flash('error', err.message);
       			 return res.redirect('back');
     		 }
      req.body.helpcamp.image = result.secure_url;
      req.body.helpcamp.imageId = result.public_id;
      req.body.helpcamp.author = {
       								 id: req.user._id,
       								 name: req.user.username,
		                             email:req.user.email,
		                             phone:req.user.phone
      }
	
	  Helpcamp.create( req.body.helpcamp ,function(err , newlyCreated){
			if(err)
				console.log(err);
			else 
				res.redirect("/helpcamps");
			});
		});
	});
});

//============================================================
//get show page
router.get("/:id",function(req, res){
		Helpcamp.findById(req.params.id).populate("queries").exec(function(err, reqHelpcamp){
			if(err)
				console.log(err);
			else 
				res.render("show", {reqHelpcamp: reqHelpcamp});
		});
});
//===================================
//get edit page
router.get( "/:id/edit",middleware.checkOwner,function(req, res){
	Helpcamp.findById(req.params.id,function(err, reqHelpcamp){
		res.render("edit", {reqHelpcamp: reqHelpcamp});
	});		
});

//==================================================
//edit helpcamp
router.put("/:id", middleware.checkOwner,upload.single('image'), function(req, res){
	 geocoder.geocode(req.body.location, function (err, data) {
	 	if (err || !data.length) {
	 	req.flash('error', 'Invalid address');
	 	return res.redirect('back');
	 	}
	 req.body.lat = data[0].latitude;
	 req.body.lng = data[0].longitude;
	 req.body.location = data[0].formattedAddress;
	 Helpcamp.findById(req.params.id, async function(err, helpcamp){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(helpcamp.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  helpcamp.imageId = result.public_id;
                  helpcamp.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
           }
            helpcamp.name = req.body.name;
            helpcamp.description = req.body.description;
			helpcamp.lat= req.body.lat;
			helpcamp.lng= req.body.lng;
			helpcamp.location= req.body.location;
            helpcamp.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/helpcamps/" +helpcamp._id);
          }
   	 });
  });
});

//======================================
//delete
router.delete('/:id', function(req, res) {
 Helpcamp.findById(req.params.id, async function(err, helpcamp) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(helpcamp.imageId);
        helpcamp.remove();
        req.flash('success', 'HelpCamp deleted successfully!');
        res.redirect('/helpcamps');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

//========================================================

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;	