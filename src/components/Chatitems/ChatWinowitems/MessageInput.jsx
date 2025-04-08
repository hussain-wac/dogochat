// components/ChatWinowitems/MessageInput.js
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SendHorizontalIcon,
  SmileIcon,
  CameraIcon,
  MicIcon,
  XIcon
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import useEmojipic from "../../../hooks/useImoji";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { uploadImageToCloudinary } from "../../../hooks/utils/uploadToCloudinary";

const MessageInput = ({ newMessage, setNewMessage, sendMessage, chatId }) => {
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiClick } = useEmojipic(setNewMessage);
  const { handleTyping } = useTypingStatus(chatId);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const fileInputRef = useRef();

  const handleSend = () => {
    if (selectedImage) return uploadAndSendImage();
    if (!newMessage.trim()) return;
    sendMessage(newMessage, "text");
  };

  const uploadAndSendImage = async () => {
    setIsUploading(true);
    try {
      const url = await uploadImageToCloudinary(selectedImage.file);
      sendMessage(url, "image");
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSelectedImage({ file, preview });
    setImagePreviewOpen(true);
  };

  const removeImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    setImagePreviewOpen(false);
  };

  return (
    <div className="p-3 border-t dark:border-neutral-700 bg-white dark:bg-neutral-900 absolute bottom-0 w-full">
      <div className="max-w-3xl mx-auto">
        {selectedImage && !imagePreviewOpen && (
          <div className="relative mb-2 w-fit">
            <img 
              src={selectedImage.preview} 
              className="h-32 rounded-lg object-cover" 
            />
            <button onClick={removeImage} className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full">
              <XIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
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

            <Popover open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current.click()} className="rounded-full">
                  <CameraIcon className="h-5 w-5 text-neutral-500" />
                </Button>
              </PopoverTrigger>
              {selectedImage && (
                <PopoverContent className="w-72 p-0 overflow-hidden rounded-lg bg-white shadow-lg">
                  <div className="flex flex-col">
                    <div className="w-full h-full">
                      <img 
                        src={selectedImage.preview} 
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                    <div className="flex justify-end p-2 border-t">
                      <button 
                        onClick={removeImage} 
                        className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-500 hover:bg-red-600 rounded"
                      >
                        <XIcon className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              )}
            </Popover>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <Button variant="ghost" size="icon" className="rounded-full hidden md:block">
              <MicIcon className="h-5 w-5 text-neutral-500" />
            </Button>
          </div>

          <Input
            placeholder={
              isUploading
                ? "Uploading..."
                : selectedImage
                ? "Send image?"
                : "Type a message..."
            }
            value={selectedImage ? "" : newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isUploading || !!selectedImage}
            className="flex-1 rounded-full py-4"
          />

          <Button
            onClick={handleSend}
            disabled={(selectedImage && isUploading) || (!selectedImage && !newMessage.trim())}
            className="rounded-full px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white"
          >
            <SendHorizontalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;