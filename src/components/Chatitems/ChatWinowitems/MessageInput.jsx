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
  PencilIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import useEmojipic from "../../../hooks/useImoji";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { uploadImageToCloudinary } from "../../../hooks/utils/uploadToCloudinary";

const MessageInput = ({ newMessage, setNewMessage, sendMessage, chatId }) => {
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiClick } = useEmojipic(setNewMessage);
  const { handleTyping } = useTypingStatus(chatId);

  const [selectedImages, setSelectedImages] = useState([]); // Array of { file, preview }
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSendingImages, setIsSendingImages] = useState(false);
  const fileInputRef = useRef();

  const handleSend = async () => {
    if (newMessage.trim()) {
      sendMessage(newMessage, "text");
      setNewMessage("");
    }

    if (selectedImages.length > 0) {
      setIsSendingImages(true);
      for (const image of selectedImages) {
        try {
          const url = await uploadImageToCloudinary(image.file);
          sendMessage(url, "image");
        } catch (error) {
          console.error("Image upload failed:", error);
        }
      }
      clearImages();
      setIsSendingImages(false);
    }
  };

  const clearImages = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setSelectedImages([]);
    setEditingIndex(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...previews]);
    e.target.value = null;
  };

  const handleEditComplete = (newFile) => {
    setSelectedImages((prev) =>
      prev.map((img, i) => (i === editingIndex ? { ...img, file: newFile, preview: URL.createObjectURL(newFile) } : img))
    );
    setEditingIndex(null);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(selectedImages[index].preview);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Image editor modal */}
      <ImageEditorModal
        open={editingIndex !== null}
        image={selectedImages[editingIndex]}
        onClose={() => setEditingIndex(null)}
        onComplete={handleEditComplete}
      />

      <div className="p-3 border-t dark:border-neutral-700 bg-white dark:bg-neutral-900 absolute bottom-0 w-full">
        <div className="max-w-3xl mx-auto">
          {/* Image previews */}
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded overflow-hidden border">
                  <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                  <button
                    className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full"
                    onClick={() => removeImage(i)}
                  >
                    <XIcon className="w-4 h-4 text-white" />
                  </button>
                  <button
                    className="absolute bottom-1 right-1 bg-black bg-opacity-50 p-1 rounded-full"
                    onClick={() => setEditingIndex(i)}
                  >
                    <PencilIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
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

              {/* Image upload */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current.click()}
                className="rounded-full"
              >
                <CameraIcon className="h-5 w-5 text-neutral-500" />
              </Button>
              <input
                type="file"
                multiple
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {/* Mic */}
              <Button variant="ghost" size="icon" className="rounded-full hidden md:block">
                <MicIcon className="h-5 w-5 text-neutral-500" />
              </Button>
            </div>

            {/* Message input */}
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

            {/* Send */}
            <Button
              onClick={handleSend}
              disabled={isSendingImages || (!newMessage.trim() && selectedImages.length === 0)}
              className="rounded-full px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white flex items-center justify-center"
            >
              {isSendingImages ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <SendHorizontalIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;
