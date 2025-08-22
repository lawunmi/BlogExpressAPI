import postModel from "../models/post.model.js";
import userModel from "../models/user.model.js";
import commentModel from "../models/comment.model.js";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import { postMedia } from "../utils/mediaUtil.js";

const createPost = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { title, content } = req.body;
    const files = req.files;
    //console.log("id: ", id);

    let mediaFile = [];
    const mediaCount = 4;

    if (!content) {
      return sendErrorResponse(res, 400, "Content is required");
    }

    const postUrl = await postMedia(files, mediaCount, res, mediaFile);

    // Create post
    const newPost = new postModel({
      owner: id,
      title,
      content,
      postMedia: postUrl,
    });
    const savedPost = await newPost.save();
    return sendSuccessResponse(res, 201, "Post created", savedPost);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { postId } = req.params;
    const payload = req.body;
    const files = req.files;

    //console.log("postId: ", postId);

    const post = await postModel.findById(postId);
    //console.log("post: ", post);
    if (!post) {
      return sendErrorResponse(res, 404, "Post does not exist");
    }

    let mediaFile = [];
    const mediaCount = 4;

    let postUrl = post.postMedia;
    if (files && files.length > 0) {
      const newMedia = await postMedia(files, mediaCount, res, mediaFile);
      postUrl = [...(post.postMedia || []), ...(newMedia || [])];
    }

    if (!post.owner.equals(id)) {
      return sendErrorResponse(res, 403, "Post belongs to another user");
    }

    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { postMedia: postUrl, ...payload },
      { new: true, runValidators: true }
    );
    return sendSuccessResponse(res, 200, "Post updated", updatedPost);
  } catch (error) {
    next(error);
  }
};

const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    //console.log("postId: ", postId);
    const post = await postModel
      .findById(postId, "-__v")
      .populate("owner", "username profilePic -_id");
    if (!post) {
      return sendErrorResponse(res, 404, "Post not found");
    }
    const comments = await commentModel
      .find({ post: postId }, "-post, -_id, -__v")
      .populate("owner", "username profilePic -_id")
      .sort({ createdAt: -1 }); // newest comment first

    const result = {
      post,
      comments,
    };
    return sendSuccessResponse(res, 200, "Post detail", result);
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const id = req.user.id;
    //console.log("id: ", id);

    const userPosts = await postModel
      .find({ owner: id }, "-__v")
      .populate("owner", "username profilePic -_id");
    // console.log("UserPost: ", userPosts);
    if (userPosts.length === 0) {
      return sendSuccessResponse(res, 200, "No post", {});
    }
    return sendSuccessResponse(res, 200, "Users post", userPosts);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id, admin } = req.user;
    const { postId } = req.params;

    const post = await postModel.findById(postId);

    if (!post) {
      return sendErrorResponse(res, 404, "Post does not exist");
    }
    if (!post.owner.equals(id) && !admin) {
      return sendErrorResponse(res, 403, "You can only delete your post");
    }

    await postModel.findByIdAndDelete(postId);
    return sendSuccessResponse(res, 200, "Post deleted");
  } catch (error) {
    next(error);
  }
};

export { createPost, updatePost, getPost, getPosts, deletePost };
