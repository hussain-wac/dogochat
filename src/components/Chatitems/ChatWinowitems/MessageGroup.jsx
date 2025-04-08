import React from "react";
import Message from "./Message";

function MessageGroup({
  date,
  msgs,
  user,
  imageRotations,
  openFullscreenImage,
  isSelectionMode,
  selectedMessages,
  toggleMessageSelection,
  formatMessageTime,
}) {
  return (
    <div className="space-y-3">
      <div className="text-center my-4 relative">
        <span className="bg-white dark:bg-neutral-900 px-3 py-1 rounded-full text-xs font-medium text-neutral-500 uppercase tracking-wide shadow-sm">
          {date === new Date().toDateString()
            ? "Today"
            : date === new Date(Date.now() - 86400000).toDateString()
            ? "Yesterday"
            : new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
        </span>
        <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-200 dark:border-neutral-700 -z-10" />
      </div>

      {msgs.map((msg) => (
        <Message
          key={msg.id}
          msg={msg}
          isSender={msg.sender === user?.uid}
          rotation={imageRotations[msg.id] || 0}
          onImageClick={openFullscreenImage}
          isSelectionMode={isSelectionMode}
          selectedMessages={selectedMessages}
          toggleMessageSelection={toggleMessageSelection}
          formatMessageTime={formatMessageTime}
        />
      ))}
    </div>
  );
}

export default MessageGroup;