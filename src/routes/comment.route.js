import express from "express";
import {
  addComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/addComment/:postId",
  authentication,
  upload.single("commentMedia"),
  addComment
);
router.delete("/deleteComment/:id", authentication, deleteComment);

export default router;
