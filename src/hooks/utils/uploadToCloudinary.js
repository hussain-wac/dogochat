// utils/uploadToCloudinary.js
import axios from "axios";

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat_app"); // from Cloudinary settings

  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/dbcxpmtem/image/upload",
    formData
  );

  return response.data.secure_url;
};
