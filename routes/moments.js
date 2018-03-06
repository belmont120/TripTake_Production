var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Moment = require("../models/moment");
var Comment = require("../models/comment");
var expressSanitizer = require("express-sanitizer");
var middleware = require("../middleware");
var multer = require("multer");
var cloudinary = require("cloudinary");
var NodeGeocoder = require("node-geocoder");
var ExifImage = require("exif").ExifImage;

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GOOGLE_MAP_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

var storage = multer.diskStorage({
    filename: function(req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error("only image files are allowed."), false);
    }
    cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
// ========Moments==============
// GET /moments
router.get("/", function (req, res) {

    Moment.find({}, function (err, allMoments) {
        if (err) {
            console.log(err);
        } else {
            // console.log("Moments From Db: ");
            // console.log(allMoments);
            res.render("moments/index", {
                moments: allMoments,
            });
        }
    });
});

router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("moments/new");
});

router.get("/:id", function (req, res) {

    Moment.findById(req.params.id).populate("comments").exec(function (err, foundMoment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            if (!foundMoment){
                req.flash("error", "The item you are requesting is not found!");
                return res.redirect("back");
            }
            // console.log("Moment From Db: ");
            // console.log(foundMoment);
            foundMoment.api_key = process.env.GOOGLE_MAP_KEY;
            res.render("moments/show", {
                foundMoment: foundMoment
            });
        }
    });
});

router.get("/:id/edit", middleware.checkMomentOwnership, function (req, res) {

    Moment.findById(req.params.id, function (err, foundMoment) {
        if(err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("moments/edit", {
                moment: foundMoment
            });
        }
    });
});

router.post("/", middleware.isLoggedIn, upload.single('moment[image]'),function (req, res) {
    var author = {
        id: req.user._id,
        username: req.user.username,
    };

    var newMoment = req.body.moment;
    newMoment.author = author;
    newMoment = sanitizeMoment(req, newMoment);
    var gps;


    new ExifImage({ image : req.file.path }, function (error, exifData) {
        // if (error) {
        //     req.flash('error', error.message);
        //     return res.redirect('back');
        // }
        // else {
        if (exifData !== undefined && exifData.gps !== undefined) {
            gps = exifData.gps;
            newMoment.latitude = convertDegreeAngleToDouble(
                gps.GPSLatitude[0], gps.GPSLatitude[1], gps.GPSLatitude[2], gps.GPSLatitudeRef);
            newMoment.longitude = convertDegreeAngleToDouble(
                gps.GPSLongitude[0], gps.GPSLongitude[1], gps.GPSLongitude[2], gps.GPSlongitudeRef);   
        }
        
        // }
    });



    geocoder.geocode(newMoment.location, function(err, data){

        if (gps === undefined && data !== undefined) {
            if (err && !data.length) {
                req.flash("error", err.message);
                return res.redirect("back");
            }

            mapGpsFromGeoCode(data[0], newMoment);
        }

        cloudinary.uploader.upload(req.file.path, function(result) {

            newMoment.image = result.secure_url;
    
            Moment.create(newMoment, function(err, moment) {
              if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
              }
              res.redirect('/moments/' + moment.id);
            });
        });
    });
});

router.put("/:id", middleware.checkMomentOwnership, function (req, res) {
    var editedMoment = req.body.moment;

    editedMoment = sanitizeMoment(req, editedMoment);

    geocoder.geocode(editedMoment.location, function(err, data){

        if (data !== undefined) {
            if (err && !data.length) {
                req.flash("error", err.message);
                return res.redirect("back");
            }

            mapGpsFromGeoCode(data[0], editedMoment);
        }

        Moment.findByIdAndUpdate(req.params.id, editedMoment, function (err, foundMoment) {
            if (err) {
                console.log(err);
                res.redirect("back");
            } else {
                if (!foundMoment){
                    req.flash("error", "The item you are requesting is not found!");
                    return res.redirect("back");
                }
                res.redirect("/moments/" + foundMoment.id);
            }
        });
    });
});

router.delete("/:id", middleware.checkMomentOwnership, middleware.removeMomentComments, middleware.removeMoment, function (req, res) {
    res.redirect("/moments");
});

function mapGpsFromGeoCode(src, des) {
    src.location = des.formattedAddress;
    src.latitude = des.latitude;
    src.longitude = des.longitude;
}

function sanitizeMoment(req, moment) {
    moment.name = req.sanitize(moment.name);

    moment.description = req.sanitize(moment.description);

    return moment;
}

function convertDegreeAngleToDouble(degrees, minutes, seconds, ref)
{
    return (degrees + (minutes/60) + (seconds/3600)) * ((ref === "S" || ref === "W") ? -1 : 1);
}

module.exports = router;