import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";
import jwt from "jsonwebtoken";
import { singleMediaUpload } from "../utils/mediaUtil.js";

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

    // Check if a user exist
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return sendErrorResponse(
        res,
        409,
        "A user with this email or username already exists"
      );
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Image upload
    let imageUrl;
    if (profilePic) {
      imageUrl = await singleMediaUpload(profilePic, "UserProfile");
    }

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
      { expiresIn: "4w" }
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

    let imageUrl = user.profilePic;
    if (profilePic) {
      imageUrl = await singleMediaUpload(profilePic, "UserProfile");
    }

    // Save to database
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl, ...updates },
      { new: true, runValidators: true }
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

const getUser = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId, "-password -__v");
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    return sendSuccessResponse(res, 200, "User detail", user);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await userModel.findById(userId);

    // Verify current password
    const isCurrentPassowrValid = bcrypt.compareSync(
      currentPassword,
      user.password
    );
    if (!isCurrentPassowrValid) {
      return sendErrorResponse(res, 400, "Current password is incorrect");
    }

    // New password hashing
    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findByIdAndUpdate(
      userId,
      { password: newHashedPassword },
      { new: true }
    );

    return sendErrorResponse(res, 200, "Password changed successfully!");
  } catch (error) {
    next(error);
  }
};

export {
  createUser,
  loginUser,
  updateUser,
  getAllUsers,
  getUser,
  changePassword,
};
