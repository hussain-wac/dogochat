import React from "react";
import { Button } from "@/components/ui/button";
import { MicIcon, SendHorizontalIcon } from "lucide-react";

const SendButton = ({
  newMessage,
  selectedImages,
  handleSend,
  isSendingImages,
  handleStartRecording,
  handleStopRecording,
  status,
  error,
}) => {
  const isRecording = status === "recording";
  const permissionDenied = error === "permission_denied";

  return !newMessage.trim() && selectedImages.length === 0 ? (
    <Button
      onMouseDown={handleStartRecording}
      onMouseUp={handleStopRecording}
      onTouchStart={handleStartRecording}
      onTouchEnd={handleStopRecording}
      onMouseLeave={handleStopRecording}
      onTouchCancel={handleStopRecording}
      className={`rounded-full px-4 py-2 text-white flex items-center justify-center ${
        isRecording
          ? "bg-red-500 hover:bg-red-600"
          : permissionDenied
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
      }`}
      disabled={isSendingImages || permissionDenied}
      title={
        permissionDenied ? "Microphone access denied" : "Press and hold to record"
      }
    >
      <MicIcon className="h-5 w-5" />
      {isRecording && <span className="ml-2 text-sm">Recording...</span>}
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
  );
};

export default SendButton;