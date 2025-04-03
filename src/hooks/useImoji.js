import { useState } from "react";

const useEmojipic = (setNewMessage,) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return { showEmojiPicker, setShowEmojiPicker, handleEmojiClick };
};

export default useEmojipic;
