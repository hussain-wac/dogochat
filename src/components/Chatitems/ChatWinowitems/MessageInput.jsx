import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageEditorModal from "../../common/ImageEditorModal";
import {
  SendHorizontalIcon,
  SmileIcon,
  CameraIcon,
  MicIcon,
  XIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import useEmojipic from "../../../hooks/useImoji";
import useTypingStatus from "../../../hooks/useTypingStatus";

const MessageInput = ({ newMessage, setNewMessage, sendMessage, chatId }) => {
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiClick } = useEmojipic(setNewMessage);
  const { handleTyping } = useTypingStatus(chatId);

  const [selectedImage, setSelectedImage] = useState(null); // { file, preview }
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const fileInputRef = useRef();

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage, "text");
    setNewMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSelectedImage({ file, preview });
    setIsEditorOpen(true);
    e.target.value = null; // Reset file input to allow re-selection
  };

  const removeImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    setIsEditorOpen(false);
  };

  return (
    <>
      {/* Image editor modal */}
      <ImageEditorModal
        open={isEditorOpen}
        image={selectedImage}
        onClose={removeImage}
        sendMessage={sendMessage} // Pass sendMessage to handle sending directly
      />

      <div className="p-3 border-t dark:border-neutral-700 bg-white dark:bg-neutral-900 absolute bottom-0 w-full">
        <div className="max-w-3xl mx-auto">
          {/* Preview thumbnail */}
          {selectedImage && !isEditorOpen && (
            <div className="relative mb-2 w-fit">
              <img
                src={selectedImage.preview}
                className="h-32 rounded-lg object-cover"
                alt="Selected preview"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full"
              >
                <XIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {/* Emoji picker */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <SmileIcon className="h-5 w-5 text-neutral-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" className="p-0 border-none">
                  <EmojiPicker onEmojiClick={handleEmojiClick} height={300} />
                </PopoverContent>
              </Popover>

              {/* Image trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current.click()}
                className="rounded-full"
              >
                <CameraIcon className="h-5 w-5 text-neutral-500" />
              </Button>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {/* Mic icon (unused) */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hidden md:block"
              >
                <MicIcon className="h-5 w-5 text-neutral-500" />
              </Button>
            </div>

            {/* Message text input */}
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping(e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-full py-4"
            />

            {/* Send button */}
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="rounded-full px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white"
            >
              <SendHorizontalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;