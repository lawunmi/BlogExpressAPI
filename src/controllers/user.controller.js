import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";
import jwt from "jsonwebtoken";

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const profilePic = req.file;

    if (!username || !email || !password) {
      return sendErrorResponse(
        res,
        400,
        "Username, email, and password are required"
      );
    }

    // Check if user with a particular email already exists
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return sendErrorResponse(
        res,
        409,
        "A user with this email already exists"
      );
    }

    // Check if user with a particular username already exists
    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return sendErrorResponse(
        res,
        409,
        "A user with this username already exists"
      );
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const imageUrl = await imageUpload(profilePic);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      profilePic: imageUrl,
      isAdmin: false,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Exclude certain fields from response
    const { password: savedPassword, __v, ...userInfo } = savedUser.toObject();

    return sendSuccessResponse(res, 201, "User created successfully", userInfo);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { userIdentifier, password } = req.body;

    // Validate required fields
    if (!userIdentifier || !password) {
      return sendErrorResponse(res, 400, "Email and password are required");
    }

    // Confirm if user exists
    const user = await userModel.findOne({
      $or: [{ email: userIdentifier }, { username: userIdentifier }],
    });
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    // Password validation
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return sendErrorResponse(res, 401, "Invalid password");
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, admin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Exclude certain fields from response
    const { password: savedPassword, _id, __v, ...userData } = user.toObject();

    // Response payload
    res
      .cookie("token", token, {
        maxAge: 2 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
      })
      .set("Authorization", `Bearer ${token}`)
      .status(200)
      .json({
        status: "success",
        message: "Login successful",
        result: userData,
      });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    //console.log("UserId: ", userId);
    const updates = req.body;
    const profilePic = req.file;

    const user = await userModel.findById(userId);
    //console.log("User: ", user);

    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }

    let imageUrl;
    if (profilePic) {
      imageUrl = await imageUpload(profilePic);
    } else {
      imageUrl = user.profilePic;
    }

    // Save to database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl, ...updates },
      { new: true }
    );

    // Exclude certain fields from response
    const { password, __v, ...userInfo } = updatedUser.toObject();

    return sendSuccessResponse(res, 200, "User updated successfully", userInfo);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    {
      const users = await userModel.find({}, "-password -__v");
      return sendSuccessResponse(res, 200, "All users", users);
    }
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id, "-password -__v");
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    return sendSuccessResponse(res, 200, "All users", user);
  } catch (error) {
    next(error);
  }
};

// Function for image upload
const imageUpload = async (file) => {
  const response = await cloudinary.uploader.upload(file.path, {
    folder: "Profile-Pics",
  });
  const imgUrl = response.secure_url;
  await fs.unlink(file.path);
  return imgUrl;
};

export { createUser, loginUser, updateUser, getAllUsers, getUserById };
