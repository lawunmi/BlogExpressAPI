import commentModel from "../models/comment.model.js";
import postModel from "../models/post.model.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import { singleMediaUpload } from "../utils/mediaUtil.js";

const addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { commentText } = req.body;
    const file = req.file;
    const userId = req.user.id;

    const post = await postModel.findById(postId);
    if (!post) {
      return sendErrorResponse(res, 404, "Post not found");
    }

    let mediaUrl;
    if (file) {
      mediaUrl = await singleMediaUpload(file, "CommentMedia");
    }

    const newComment = new commentModel({
      owner: userId,
      post: postId,
      commentText: commentText,
      commentMedia: mediaUrl,
    });

    const savedComment = await newComment.save();
    return sendSuccessResponse(res, 201, "Comment added", savedComment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user.id;

    if (user) {
      const deleteComment = await commentModel.findByIdAndDelete(id);
      if (deleteComment) {
        sendSuccessResponse(res, 200, "Comment deleted");
      }
    }
  } catch (error) {
    next(error);
  }
};

export { addComment, deleteComment };
