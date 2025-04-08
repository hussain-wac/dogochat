import { useState } from "react";

const useFullscreenImage = (user) => {
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [imageRotations, setImageRotations] = useState({});

  const openFullscreenImage = (msg) => {
    setFullscreenImage({
      id: msg.id,
      url: msg.imageUrl,
      isSender: msg.sender === user.uid,
      timestamp: msg.timestamp,
      rotation: imageRotations[msg.id] || 0,
    });
  };

  const closeFullscreenImage = () => {
    setFullscreenImage(null);
  };

  return {
    fullscreenImage,
    openFullscreenImage,
    closeFullscreenImage,
    imageRotations,
    setImageRotations,
  };
};

export default useFullscreenImage;
