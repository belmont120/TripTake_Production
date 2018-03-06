var Moment = require("../models/moment");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please login to proceed.");
    res.redirect("/login");
}

middlewareObj.checkMomentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Moment.findById(req.params.id, function (err, foundMoment) {
            if (err) {
                res.redirect("back");
            } else {
                if (foundMoment && foundMoment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You are not authorised to do that.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login to proceed.");
        res.redirect("back");
    }
}

middlewareObj.removeMomentComments = function(req, res, next) {
    Moment.findById(req.params.id, function(err, foundMoment){
            if(err) {
                console.log(err);
                res.redirect("back");
            } else {
                Comment.remove({
                    _id: {
                        $in: foundMoment.comments
                    }
                }, function(err, result){
                    if(err) {
                        console.log(err);
                        res.redirect("back");
                    } else {
                        next();
                    }
                });
            }
        }
    );
}

middlewareObj.removeMoment = function(req, res, next){
    Moment.findByIdAndRemove(req.params.id, function (err, foundMoment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            next();
        }
    });
}

middlewareObj.removeCommentReference = function(req, res, next) {
    Moment.findByIdAndUpdate(req.params.id, 
        {
            $pull: {
                comments: req.params.comment_id
            }
        }, function(err, foundMoment){
            if(err) {
                console.log(err);
                res.redirect("back");
            } else {
                next();
            }
        }
    );
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        Moment.findById(req.params.id, function (err, foundMoment) {
            if (err) {
                res.redirect("back");
            } else {
                if (!foundMoment) {
                    res.redirect("back");
                }

                Comment.findById(req.params.comment_id, function (err, foundComment) {
                    if (err) {
                        res.redirect("back");
                    } else {

                        if (foundComment && foundComment.author.id.equals(req.user._id)) {
                            next();
                        } else {
                            res.redirect("back");
                        }
                    }
                });
            }
        });
    } else {
        req.flash("error", "Please login to proceed.");
        res.redirect("back");
    }
}


module.exports = middlewareObj;










