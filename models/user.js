var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new Schema({
    username: String,
    password: String,
    avatar: {type: String, default: 'http://www.careerbased.com/themes/comb/img/avatar/default-avatar-male_11.png'},
    firstName: String,
    lastName: String,
    email: String,
    description: String,
    isAdmin: {type: Boolean, default: false},
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);