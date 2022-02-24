const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  content: String,
  createdAt: String,
  score: Number,
  replyingTo: String,
  user: {
    image: {
      png: String,
      webp: String,
    },
    username: String,
  },
  // comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
});

module.exports = mongoose.model("Reply", ReplySchema);
