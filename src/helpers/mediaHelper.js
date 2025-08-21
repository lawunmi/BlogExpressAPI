import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";
import { sendErrorResponse } from "../utils/response.js";

// Single image upload
export const imageUpload = async (file, name) => {
  const response = await cloudinary.uploader.upload(file.path, {
    folder: "Users-Profile",
  });
  const imgUrl = response.secure_url;
  await fs.unlink(file.path);
  return imgUrl;
};

// Array image upload
const postImageUpload = async (file, name) => {
  const uploadedImages = [];
  for (const img of file) {
    const response = await cloudinary.uploader.upload(img.path, {
      folder: `${name}`,
      resource_type: "auto",
    });
    uploadedImages.push(response.secure_url);
    await fs.unlink(img.path);
  }
  return uploadedImages;
};

export const postMedia = async (files, count, res, media) => {
  if (files && files.length > 0) {
    if (files.length > count) {
      return sendErrorResponse(
        res,
        400,
        `You can only upload up to ${count} files in a post`
      );
    }
    const result = await postImageUpload(files, "Post-Media");
    media = result.map((file, index) => ({
      postMediaUrl: file,
      postMediaType: files[index].mimetype.startsWith("video")
        ? "video"
        : "image",
    }));
    return media;
  }
};
