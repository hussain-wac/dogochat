import React from "react";
import AudioMessage from "./AudioMessage";
import { Check, CheckCheck } from "lucide-react";

export default function Message({ msg, isSender, formatMessageTime, onImageClick }) {
  return (
    <div
      data-message-id={msg.id} // Add this attribute
      className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3 px-2`}
    >
      <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
        <div
          className={`rounded-2xl overflow-hidden ${
            isSender
              ? "bg-orange-500 text-white rounded-tr-none"
              : "bg-neutral-700 text-white rounded-tl-none"
          }`}
        >
          {msg.type === "audio" && msg.audioUrl ? (
            <div className="w-64 max-w-full">
              <AudioMessage audioUrl={msg.audioUrl} isSender={isSender} />
            </div>
          ) : msg.type === "image" && msg.imageUrl ? (
            <div className="cursor-pointer" onClick={() => onImageClick(msg)}>
              <img
                src={msg.imageUrl}
                alt="Sent image"
                className="w-full max-h-64 object-contain rounded-2xl"
              />
            </div>
          ) : (
            <div className="p-3 text-sm break-words">{msg.text || ""}</div>
          )}
        </div>

        <div
          className={`text-xs text-neutral-400 flex items-center gap-1 ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatMessageTime(msg.timestamp)}</span>
          {isSender && (
            <>
              {msg.status === "sent" && (
                <Check className="w-4 h-4 text-neutral-400" />
              )}
              {msg.status === "delivered" && (
                <CheckCheck className="w-4 h-4 text-neutral-400" />
              )}
              {msg.status === "read" && (
                <CheckCheck className="w-4 h-4 text-blue-400" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}