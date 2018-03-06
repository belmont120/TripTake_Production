var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Moment = require("../models/moment");
var Comment = require("../models/comment");
var expressSanitizer = require("express-sanitizer");
var middleware = require("../middleware");


// ========Comments==============

router.get("/new", middleware.isLoggedIn, function (req, res) {
    Moment.findById(req.params.id, function (err, foundMoment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            if (!foundMoment){
                req.flash("error", "The item you are requesting is not found!");
                return res.redirect("back");
            }

            res.render("comments/new", {
                moment: foundMoment
            });
        }
    });
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    req.body.comment.text = req.sanitize(req.body.comment.text);

    Moment.findById(req.params.id, function (err, foundMoment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            if (!foundMoment){
                req.flash("error", "The item you are requesting is not found!");
                return res.redirect("back");
            }

            Comment.create(req.body.comment, function (err, newComment) {
                if (err) {
                    console.log();
                } else {
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();

                    foundMoment.comments.push(newComment);
                    foundMoment.save();
                    req.flash("success", "Comment successfully added.");
                    res.redirect("/moments/" + req.params.id);
                }
            });
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    var momentId = req.params.id;
    var commentId = req.params.comment_id;

    Moment.findById(momentId, function (err, foundMoment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            if (!foundMoment){
                req.flash("error", "The item you are requesting is not found!");
                return res.redirect("back");
            }

            Comment.findById(commentId, function (err, foundComment) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if (!foundComment){
                        req.flash("error", "The item you are requesting is not found!");
                        return res.redirect("back");
                    }
        
                    res.render("comments/edit", {
                        momentId: momentId,
                        comment: foundComment
                    });
                }
            });
        }
    });


});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    var momentId = req.params.id;
    var commentId = req.params.comment_id;
    req.body.comment.text = req.sanitize(req.body.comment.text);

    var redirectPath = "/moments/" + momentId;

    Comment.findByIdAndUpdate(commentId, req.body.comment, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            if (!foundComment){
                req.flash("error", "The item you are requesting is not found!");
                return res.redirect("back");
            }

            req.flash("success", "Comment successfully edited.");
            res.redirect(redirectPath);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, middleware.removeCommentReference, function(req, res) {
    var momentId = req.params.id;
    var commentId = req.params.comment_id;

    var redirectPath = "/moments/" + momentId;

    Comment.findByIdAndRemove(commentId, function (err, foundComment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            functions.checkObjExistAndPushFlash(req, res, foundComment);
            res.redirect(redirectPath);
        }
    });    
});

module.exports = router;