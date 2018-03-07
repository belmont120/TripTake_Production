var Moment = require("../models/moment");
var Comment = require("../models/comment");
var User = require("../models/user");

var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.sendStatus(403);
}

middlewareObj.checkUserOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {
        User.findById(req.params.id, function (err, foundUser) {
            if (err) {
                res.sendStatus(404);
            } else {
                if (foundUser && foundUser._id.equals(req.user._id)) {
                    next();
                } else {
                    res.sendStatus(403);
                }
            }
        });
    } else {
        res.sendStatus(403);
    }
}


module.exports = middlewareObj;










