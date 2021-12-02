var express=require("express")
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var Campgroud=require("../models/campgrounds");
var async=require("async");
var sendgridTransport = require("nodemailer-sendgrid-transport");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

var transporter = nodemailer.createTransport(sendgridTransport({
	auth: {
		api_key:"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"
	}
}));

router.get("/", function(req , res){
	res.render("landing");		
	})

//=========================================================

router.get("/register", function(req, res){
	res.render("register" , {page: "register"});
})

router.post("/register", function(req, res){
	var newUser= new User({
		username:req.body.username,
		firstname:req.body.firstname,
		lastname:req.body.lastname,
		email:req.body.email,
		address:req.body.address,
		phone:req.body.phone,
	})
	User.register(newUser, req.body.password, function(err ,user){
		if(err){
			req.flash("error", err.message)
			 res.redirect("register")
		}
		else{
			transporter.sendMail({
				to:user.email,
				from:"vishantchaudhary007@gmail.com",
				subject:"Successfully Signed UP",
				html:"<strong><h1>WELCOME TO DOT TECH</h1></strong><h4>We are glad you are here.We will make our best to help you.</h4><h3>CHEERS!</h3>"
			})
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome "+user.username)
			res.redirect("/helpcamps");
		})
		}
	})
})

router.get("/login", function(req, res){
	res.render("login", {page: "login"});
})

router.post("/login",function(req,res,next) {
	passport.authenticate("local" , {
	successRedirect: "/helpcamps",
	failureRedirect: "/login",
	failureFlash: true,
	successFlash: "Welcome Back "+ req.body.username.toUpperCase()+"!"
})(req, res)
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged Out, See You Soon")
	res.redirect("/helpcamps");
});

router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
			transporter.sendMail({
				to:user.email,
				from:"vishantchaudhary007@gmail.com",
				subject:"Successfully Signed UP",
				html:'You are receiving this because you (or someone else) have requested the reset of the password for your DOT TECH account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			}
     , function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  })
	}
	  ])
})

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
     	transporter.sendMail({
				to:user.email,
				from:"vishantchaudhary007@gmail.com",
				subject:"Successfully Signed UP",
				html:'Hello,\n\n' +
          'This is a confirmation that the password for your HELPING HANDS account ' + user.email + ' has just been changed.\n'
		})
             res.redirect('/helpcamps');
		}
]);
});
	
router.get("/user/:id",function(req,res){
	User.findById(req.params.id, function(err, foundUser){
		if(err)
			console.log(err);
		else{
			Campgroud.find().where("author.id").equals(foundUser._id).exec(function(err, other){
			 if(err)
				 console.log(err)
				else
					res.render("userprofile", {foundUser: foundUser,reqCampground: other})
			})
		}
	})
})

module.exports =router;