import React from "react";
import AudioMessage from "./AudioMessage";
import { Check, CheckCheck } from "lucide-react";

export default function Message({
  msg,
  isSender,
  formatMessageTime,
  onImageClick,
}) {

  console.log(msg)
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
            <div className="p-3 text-sm break-words">{msg.text || ""}</div>
          )}
        </div>

        <div
          className={`text-xs text-neutral-400 mt-1 flex items-center ${
            isSender ? "justify-end" : "justify-start"
          }`}
        >
          <span>{formatMessageTime(msg.timestamp)}</span>

          {isSender && (
            <span className="ml-1 flex items-center">
              {msg.status === "sent" && (
                <Check className="w-4 h-4 text-neutral-400" />
              )}

              {msg.status === "delivered" && (
                <CheckCheck className="w-4 h-4 text-neutral-400" />
              )}

              {msg.status === "read" && (
                <CheckCheck className="w-4 h-4 text-blue-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
