import cloudinary from "./cloudinary.js";
import fs from "fs/promises";
import { sendErrorResponse } from "./response.js";

// Single media upload logic
export const singleMediaUpload = async (file, name) => {
  const response = await cloudinary.uploader.upload(file.path, {
    folder: `${name}`,
    resource_type: "auto",
  });
  const imgUrl = response.secure_url;
  await fs.unlink(file.path);
  return imgUrl;
};

// Array media upload logic
const arrayMediaUpload = async (file, name) => {
  const uploadedMedia = [];
  for (const img of file) {
    const response = await cloudinary.uploader.upload(img.path, {
      folder: `${name}`,
      resource_type: "auto",
    });
    uploadedMedia.push(response.secure_url);
    await fs.unlink(img.path);
  }
  return uploadedMedia;
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
    const result = await arrayMediaUpload(files, "Post-Media");
    media = result.map((file, index) => ({
      postMediaUrl: file,
      postMediaType: files[index].mimetype.startsWith("video")
        ? "video"
        : "image",
    }));
    return media;
  }
};
