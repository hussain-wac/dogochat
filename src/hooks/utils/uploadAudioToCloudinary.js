// hooks/utils/uploadAudioToCloudinary.js
export const uploadAudioToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat_app"); // Replace with yours
  
    const res = await fetch("https://api.cloudinary.com/v1_1/dbcxpmtem/video/upload", {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
    return data.secure_url;
  };
  