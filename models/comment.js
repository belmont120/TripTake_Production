var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},    
    author: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
});

module.exports = mongoose.model("Comment", commentSchema);