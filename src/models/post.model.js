import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postMedia: [
      {
        postMediaUrl: { type: String },
        postMediaType: {
          type: String,
          enum: ["image", "video"],
        },
      },
    ],
  },
  { timestamps: true }
);

const postModel = mongoose.model("Post", postSchema);
export default postModel;
