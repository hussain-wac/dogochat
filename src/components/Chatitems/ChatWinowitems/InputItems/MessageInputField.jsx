import React from "react";
import { Input } from "@/components/ui/input";

const MessageInputField = ({
  newMessage,
  setNewMessage,
  handleTyping,
  handleSend,
  isSendingImages,
}) => {
  return (
    <Input
      placeholder="Type a message..."
      value={newMessage}
      onChange={(e) => {
        setNewMessage(e.target.value);
        handleTyping(e.target.value);
      }}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
      className="flex-1 rounded-full py-4"
      disabled={isSendingImages}
    />
  );
};

export default MessageInputField;