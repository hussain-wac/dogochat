import React from "react";
import AudioMessage from "./AudioMessage";

export default function Message({
  msg,
  isSender,
  formatMessageTime,
  onImageClick,
}) {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}>
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`rounded-2xl overflow-hidden ${
            isSender
              ? "bg-orange-500 text-white rounded-tr-none"
              : "bg-neutral-700 text-white rounded-tl-none"
          }`}
        >
          {msg.type === "audio" && msg.audioUrl ? (
            <div className="w-60">
              <AudioMessage audioUrl={msg.audioUrl} isSender={isSender} />
            </div>
          ) : msg.type === "image" && msg.imageUrl ? (

          <div onClick={() => onImageClick(msg)}>
            <img
              src={msg.imageUrl}
              alt="Sent image"
              className="object-cover max-h-64 w-full"
            />
          </div>
          ) : (
            <div className="p-3 text-sm break-words">
              {msg.text || ""}
            </div>
          )}
        </div>

        <div
          className={`text-xs text-neutral-400 mt-1 flex items-center ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatMessageTime(msg.timestamp)}</span>
          {isSender && (
            <span className="ml-1">
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.0001 1L6.00006 10L2.00006 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
