var mongoose = require("mongoose");

var momentSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    latitude: Number,
    longitude: Number,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }],
});

module.exports = mongoose.model("Moment", momentSchema);

