var express = require("express");
var router = express.Router({
    mergeParams: true
});
var User = require("../models/user");
var expressSanitizer = require("express-sanitizer");
var apiMiddleware = require("../apiMiddleware");





// ========Comments==============

router.get("/:id", function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            res.sendStatus(500);
        } else {
            if (!foundUser){
                res.sendStatus(404);
            }
            res.status(200);
            res.json(foundUser);
        }
    });
});


router.put("/:id", apiMiddleware.isLoggedIn, apiMiddleware.checkUserOwnership, 
    function (req, res) {
    console.log(req.body);

    User.findByIdAndUpdate(req.params.id, req.body, function (err, foundUser) {
        if (err) {
            res.sendStatus(500);
        } else {
            if (!foundUser){
                res.sendStatus(404);
            }
            res.sendStatus(200);
        }
    });
});

module.exports = router;

