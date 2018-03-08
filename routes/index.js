var express     = require("express");
var router      = express.Router({mergeParams: true});
var passport    = require("passport");
var User        = require("../models/user");
var expressSanitizer = require("express-sanitizer");
var Moment  = require("../models/moment");

router.get("/", function (req, res) {
    res.render("landing");
});

// Auth Routes
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = createNewUser(req.body);

    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to TripTake " + user.username);
            res.redirect("/moments");
        });
    });
});

router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/moments",
        failureRedirect: "/login",
    }), function(req, res){
        
});

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logout Successful");
    res.redirect("/moments");
});

router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            Moment.find().where("author.id").equals(foundUser._id).exec(function(err, foundMoments){
                if(err) {
                    req.flash("error", err.message);
                    res.redirect("back");
                } else {

                    res.render("users/show", {user: foundUser, moments: foundMoments});
                }
            });
        }
    });
});

router.put("/users/:id", function(req, res){
    var user = req.body.user;
    user.description = req.sanitize(user.description);

    User.findByIdAndUpdate(req.params.id, user, function(err, foundUser) {
        if(err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {

            res.redirect("/users/" + req.params.id);
        }
    });
});

function createNewUser(reqBody){
    var newUser = new User();
    newUser.username = reqBody.username;
    newUser.firstName = reqBody.firstName;
    newUser.lastName = reqBody.lastName;
    newUser.email = reqBody.email;
    newUser.avatar = reqBody.avatar;
    
    return newUser;
}

module.exports = router; 