import express from "express";
import {
  createUser,
  loginUser,
  updateUser,
  getAllUsers,
  getUserById,
} from "../controllers/user.controller.js";
import upload from "../utils/multer.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/createUser", upload.single("profilePic"), createUser);
router.post("/login", loginUser);
router.put(
  "/updateUser/:id",
  authentication,
  upload.single("profilePic"),
  updateUser
);
router.get("/getUsers", authentication, adminMiddleware, getAllUsers);
router.get("/getUserByID/:id", authentication, adminMiddleware, getUserById);

export default router;
