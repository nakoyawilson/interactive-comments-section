const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Comment = require("./models/comment");
const Reply = require("./models/reply");
const data = require("./data.json");
const { populate } = require("./models/comment");

mongoose.connect("mongodb://localhost:27017/comment_tracker");

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("Database connected");
});

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", async (req, res) => {
  const currentUser = data.currentUser;
  const comments = await Comment.find({}).populate("replies");
  res.send({ comments });
  res.render("home", { currentUser, comments });
});

app.post("/add", async (req, res) => {
  const formName = req.body.formName;
  const currentUserData = JSON.parse(req.body.currentUser);
  const commentContent = req.body.commentContent;
  const currentTime = new Date().toLocaleTimeString();
  const newComment = new Comment({
    content: commentContent,
    createdAt: currentTime,
    score: 0,
    user: currentUserData,
    replies: [],
  });
  await newComment.save();
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
    const reply = Reply.findOne({ _id: id });
    res.send(reply);
  }
  res.redirect(req.get("referer"));
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await Comment.findByIdAndDelete(id);
  res.redirect(req.get("referer"));
});

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
