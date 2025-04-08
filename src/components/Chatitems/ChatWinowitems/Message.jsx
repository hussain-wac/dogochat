import React from "react";
import { CheckIcon } from "lucide-react";
import { LinkifyText } from "./LinkifyText";

function Message({
  msg,
  isSender,
  rotation,
  onImageClick,
  isSelectionMode,
  selectedMessages,
  toggleMessageSelection,
  formatMessageTime,
}) {
  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}>
      {isSelectionMode && isSender && (
        <div className="self-end mr-2">
          <input
            type="checkbox"
            checked={selectedMessages.includes(msg.id)}
            onChange={() => toggleMessageSelection(msg.id)}
            className="h-4 w-4"
          />
        </div>
      )}
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`p-3 rounded-2xl overflow-hidden shadow-sm ${
            isSender
              ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-tr-none"
              : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-tl-none"
          }`}
        >
          {msg.type === "image" && msg.imageUrl ? (
            <div onClick={() => onImageClick(msg)} className="cursor-pointer">
              <img
                src={msg.imageUrl}
                alt="chat"
                className="rounded-lg max-h-60 w-auto object-cover"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
          ) : (
            <div className="text-sm break-words">
              <LinkifyText text={msg.text || ""} />
            </div>
          )}
        </div>

        <div
          className={`text-xs text-neutral-500 mt-1 ${
            isSender ? "text-right" : "text-left"
          }`}
        >
          <span>{formatMessageTime(msg.timestamp)}</span>
          {isSender && msg.status && (
            <span className="inline-flex items-center ml-1">
              {msg.status === "sent" && (
                <CheckIcon className="h-3.5 w-3.5 text-neutral-400" />
              )}
              {msg.status === "delivered" && (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-neutral-400" />
                  <CheckIcon className="h-3.5 w-3.5 text-neutral-400 -ml-2" />
                </>
              )}
              {msg.status === "read" && (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-orange-500" />
                  <CheckIcon className="h-3.5 w-3.5 text-orange-500 -ml-2" />
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
