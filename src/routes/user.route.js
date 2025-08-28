import express from "express";
import {
  createUser,
  loginUser,
  updateUser,
  getAllUsers,
  getUser,
  changePassword,
} from "../controllers/user.controller.js";
import upload from "../utils/multer.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/createUser", upload.single("profilePic"), createUser);
router.post("/login", loginUser);
router.put(
  "/updateUser",
  authentication,
  upload.single("profilePic"),
  updateUser
);
router.get("/getUsers", authentication, adminMiddleware, getAllUsers);
router.get("/getUser", authentication, getUser);
router.put("/changePassword", authentication, changePassword);

export default router;
