// MessageInput.jsx
import React, { useRef, useState, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from "emoji-picker-react";
import useEmojipic from "../../../hooks/useImoji";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { uploadImageToCloudinary } from "../../../hooks/utils/uploadToCloudinary";
import { uploadAudioToCloudinary } from "../../../hooks/utils/uploadAudioToCloudinary";
import { useReactMediaRecorder } from "react-media-recorder";

const MessageInput = ({ newMessage, setNewMessage, sendMessage, chatId }) => {
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiClick } = useEmojipic(setNewMessage);
  const { handleTyping } = useTypingStatus(chatId);

  const [selectedImages, setSelectedImages] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSendingImages, setIsSendingImages] = useState(false);
  const fileInputRef = useRef();

  const handleAudioSend = async (blobUrl) => {
    console.log("Handling audio send with blob URL:", blobUrl);
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const url = await uploadAudioToCloudinary(file);
      console.log("Audio uploaded successfully:", url);
      sendMessage(url, "audio");
    } catch (err) {
      console.error("Audio upload failed:", err);
    }
  };

  const { 
    status, 
    startRecording, 
    stopRecording, 
    mediaBlobUrl, 
    error 
  } = useReactMediaRecorder({
    audio: true,
    onStop: (blobUrl) => {
      console.log("Recording stopped, blob URL:", blobUrl);
      handleAudioSend(blobUrl);
    },
    onError: (err) => {
      console.error("Media recorder error:", err);
    }
  });

  useEffect(() => {
    console.log("Recorder status:", status);
    console.log("Recorder error:", error);
    if (error === "permission_denied") {
      alert("Microphone access denied. Please enable microphone permissions in your browser settings.");
    }
  }, [status, error]);

  const handleStartRecording = (e) => {
    e.preventDefault();
    console.log("Starting recording, current status:", status);
    if (status !== "recording") {
      startRecording();
    }
  };

  const handleStopRecording = (e) => {
    e.preventDefault();
    console.log("Stopping recording, current status:", status);
    if (status === "recording") {
      stopRecording();
    }
  };

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
      prev.map((img, i) =>
        i === editingIndex
          ? { ...img, file: newFile, preview: URL.createObjectURL(newFile) }
          : img
      )
    );
    setEditingIndex(null);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(selectedImages[index].preview);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <ImageEditorModal
        open={editingIndex !== null}
        image={selectedImages[editingIndex]}
        onClose={() => setEditingIndex(null)}
        onComplete={handleEditComplete}
      />

      <div className="p-3 border-t dark:border-neutral-700 bg-white dark:bg-neutral-900 absolute bottom-0 w-full">
        <div className="max-w-3xl mx-auto">
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {selectedImages.map((img, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded overflow-hidden border"
                >
                  <img
                    src={img.preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
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
            </div>

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

            {!newMessage.trim() && selectedImages.length === 0 ? (
              <Button
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
                onMouseLeave={handleStopRecording} // Stop if mouse leaves button
                onTouchCancel={handleStopRecording} // Stop if touch is interrupted
                className={`rounded-full px-4 py-2 text-white flex items-center justify-center ${
                  status === "recording"
                    ? "bg-red-500 hover:bg-red-600"
                    : error === "permission_denied"
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
                }`}
                disabled={isSendingImages || error === "permission_denied"}
                title={error === "permission_denied" ? "Microphone access denied" : "Press and hold to record"}
              >
                <MicIcon className="h-5 w-5" />
                {status === "recording" && (
                  <span className="ml-2 text-sm">Recording...</span>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={isSendingImages}
                className="rounded-full px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white flex items-center justify-center hover:from-orange-500 hover:to-orange-600"
              >
                {isSendingImages ? (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  <SendHorizontalIcon className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;