if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Comment = require("./models/comment");
const Reply = require("./models/reply");
const data = require("./data.json");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/comment_tracker";
mongoose.connect(dbUrl);

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("Database connected");
});

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
  const currentUser = data.currentUser;
  const comments = await Comment.find({}).populate("replies.reply");
  res.render("home", { currentUser, comments });
});

app.post("/add", async (req, res) => {
  const formName = req.body.formName;
  const currentUserData = JSON.parse(req.body.currentUser);
  const commentContent = req.body.commentContent;
  const currentTime = new Date().toLocaleTimeString();
  if (formName === "addComment") {
    const newComment = new Comment({
      content: commentContent,
      createdAt: currentTime,
      score: 0,
      user: currentUserData,
      replies: [],
    });
    await newComment.save();
  } else if (formName === "addReply") {
    const commentId = req.body.commentId;
    const replyingTo = req.body.replyingTo;
    const newReply = new Reply({
      content: commentContent,
      createdAt: currentTime,
      score: 0,
      replyingTo: replyingTo,
      user: currentUserData,
    });
    await newReply.save();
    const replyToAdd = { reply: newReply._id };
    const commentToUpdate = await Comment.findById(commentId);
    commentToUpdate.replies.push(replyToAdd);
    await commentToUpdate.save();
  }
  res.redirect(req.get("referer"));
});

app.patch("/edit/:id", async (req, res) => {
  const formName = req.body.formName;
  const { id } = req.params;
  const updatedComment = req.body.commentContent;
  if (formName === "editComment") {
    await Comment.findByIdAndUpdate(id, {
      content: updatedComment,
    });
  } else if (formName === "editReply") {
    await Reply.findByIdAndUpdate(id, {
      content: updatedComment,
    });
  }
  res.redirect(req.get("referer"));
});

app.delete("/delete/:id", async (req, res) => {
  const formName = req.body.formName;
  const { id } = req.params;
  if (formName === "deleteComment") {
    await Comment.findByIdAndDelete(id);
  } else if (formName === "deleteReply") {
    const commentId = req.body.commentId;
    const arrayId = req.body.arrayId;
    await Reply.findByIdAndDelete(id);
    const commentToUpdate = await Comment.findById(commentId);
    commentToUpdate.replies.pull(arrayId);
    await commentToUpdate.save();
  }
  res.redirect(req.get("referer"));
});

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
