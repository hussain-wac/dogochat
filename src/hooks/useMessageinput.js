import { useState, useRef, useEffect } from "react";
import useTypingStatus from "./useTypingStatus";
import { uploadImageToCloudinary } from "./utils/uploadToCloudinary";
import { uploadAudioToCloudinary } from "./utils/uploadAudioToCloudinary";
import useEmojipic from "./useImoji";
import { useReactMediaRecorder } from "react-media-recorder";
const useMessageinput = (newMessage, setNewMessage, sendMessage, chatId) => {
  const { showEmojiPicker, setShowEmojiPicker, handleEmojiClick } =
    useEmojipic(setNewMessage);
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
      const file = new File([blob], `voice-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      const url = await uploadAudioToCloudinary(file);
      console.log("Audio uploaded successfully:", url);
      sendMessage(url, "audio");
    } catch (err) {
      console.error("Audio upload failed:", err);
    }
  };

  const { status, startRecording, stopRecording, mediaBlobUrl, error } =
    useReactMediaRecorder({
      audio: true,
      onStop: (blobUrl) => {
        console.log("Recording stopped, blob URL:", blobUrl);
        handleAudioSend(blobUrl);
      },
      onError: (err) => {
        console.error("Media recorder error:", err);
      },
    });

  useEffect(() => {
    console.log("Recorder status:", status);
    console.log("Recorder error:", error);
    if (error === "permission_denied") {
      alert(
        "Microphone access denied. Please enable microphone permissions in your browser settings."
      );
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

  return {
    editingIndex,
    setEditingIndex,
    isSendingImages,
    fileInputRef,
    handleStartRecording,
    handleStopRecording,
    handleSend,
    handleFileChange,
    handleEditComplete,
    removeImage,
    status,
    error,
    selectedImages,
    setShowEmojiPicker,
    handleEmojiClick,
    handleTyping,
    showEmojiPicker,
  };
};

export default useMessageinput;
