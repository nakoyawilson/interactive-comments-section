const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: String,
  createdAt: String,
  score: Number,
  user: {
    image: {
      png: String,
      webp: String,
    },
    username: String,
  },
  replies: [{ type: [mongoose.Schema.Types.ObjectId], ref: "Reply" }],
});

module.exports = mongoose.model("Comment", CommentSchema);
