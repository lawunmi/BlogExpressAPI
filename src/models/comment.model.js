import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentText: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    commentMedia: {
      type: String,
    },
  },
  { timestamps: true }
);

const commentModel = mongoose.model("Comment", commentSchema);
export default commentModel;
