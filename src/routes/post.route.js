import express from "express";
import {
  createPost,
  updatePost,
  getPost,
  getPosts,
  deletePost,
} from "../controllers/post.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/newPost", authentication, upload.array("postMedia"), createPost);
router.put(
  "/updatePost/:postId",
  authentication,
  upload.array("postMedia"),
  updatePost
);
router.get("/getPost/:postId", getPost);
router.get("/getPosts", authentication, getPosts);
router.delete("/deletePost/:postId", authentication, deletePost);

export default router;
