require('dotenv').config();

var express= require("express");
var app=express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport=require("passport");
var localStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride=require("method-override");
var seedDB =require("./seeds");
var Helpcamp= require("./models/campgrounds");
var User=require("./models/user");
var Query =require("./models/comments");
var flash= require("connect-flash");


var queryRoutes= require("./routes/comments")
var helpcampRoutes= require("./routes/campgrounds")
var indexRoutes= require("./routes/index")


mongoose.connect('mongodb://uname:pass@cluster0-shard-00-00.f3pbn.mongodb.net:27017,cluster0-shard-00-01.f3pbn.mongodb.net:27017,cluster0-shard-00-02.f3pbn.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-128n6s-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');


app.use(require("express-session")({
		secret: "hey",
	resave: false,
	saveUninitialized: false
		}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser=	req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
})

app.use("/helpcamps",  helpcampRoutes);
app.use("/helpcamps/:id/queries", queryRoutes);
app.use(indexRoutes);

var port = process.env.PORT || 5000;

app.listen( port, function(){
	console.log("Server has started");
})
	
	
	
