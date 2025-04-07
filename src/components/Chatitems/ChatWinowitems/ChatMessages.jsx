// src/components/ChatWinowitems/ChatMessages.jsx
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, Trash2Icon } from "lucide-react";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { Button } from "@/components/ui/button";
import { LinkifyText } from "./LinkifyText";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover components

function ChatMessages({
  scrollAreaRef,
  isLoading,
  groupedMessages,
  user,
  formatMessageTime,
  selectedMessages = [],
  toggleMessageSelection,
  handleDeleteMessages,
  isSelectionMode = false,
  chatId,
  isFetchingOlderMessages,
}) {
  const { typingUsersCount, typingUsersNames } = useTypingStatus(chatId);

  // Dedupe messages by ID
  const renderMessages = {};
  Object.entries(groupedMessages).forEach(([date, msgs]) => {
    renderMessages[date] = msgs.filter(
      (m, i, arr) => i === arr.findIndex((x) => x.id === m.id)
    );
  });

  return (
    <div className="flex flex-col flex-1 h-full">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-2 sm:px-4 py-2 max-h-[80svh] sm:max-h-[80svh]"
      >
        <div className="space-y-4 pb-6">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} mb-4`}
              >
                <div className="flex flex-col max-w-[75%] sm:max-w-[70%]">
                  <Skeleton
                    className={`h-12 ${
                      i % 2 === 0 ? "w-48 sm:w-64" : "w-40 sm:w-48"
                    } rounded-xl`}
                  />
                  <Skeleton className="h-3 w-16 mt-1 ml-auto" />
                </div>
              </div>
            ))
          ) : (
            Object.entries(renderMessages).map(([date, msgs]) => (
              <div key={date} className="space-y-3">
                {/* Date separator */}
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

                {/* Messages for this date */}
                {msgs.map((msg) => {
                  const isSender = msg.sender === user.uid;
                  return (
                    <div
                      key={msg.id}
                      data-message-id={msg.id}
                      className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}
                    >
                      {isSelectionMode && isSender && (
                        <div className="self-end mr-2">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(msg.id)}
                            onChange={() => toggleMessageSelection(msg.id)}
                            className="h-4 w-4 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      )}

                      <div className="flex flex-col max-w-[75%]">
                        <div
                          className={`p-3 rounded-2xl shadow-sm overflow-hidden ${
                            isSender
                              ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-tr-none"
                              : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          {msg.type === "image" && msg.imageUrl ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <img
                                  src={msg.imageUrl}
                                  alt="Sent image"
                                  className="rounded-lg max-h-60 w-auto object-cover cursor-pointer"
                                  onError={(e) => {
                                    console.error(
                                      `Failed to load image: ${msg.imageUrl}`
                                    );
                                    e.target.style.display = "none";
                                  }}
                                  onLoad={() =>
                                    console.log(`Image loaded: ${msg.imageUrl}`)
                                  }
                                />
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0 border-none bg-transparent shadow-none"
                                align="center"
                              >
                                <div className="relative">
                                  <img
                                    src={msg.imageUrl}
                                    alt="Image preview"
                                    className="max-h-[80vh] max-w-[80vw] object-contain rounded-lg"
                                    onError={(e) => {
                                      console.error(
                                        `Failed to load preview image: ${msg.imageUrl}`
                                      );
                                      e.target.style.display = "none";
                                    }}
                                  />
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <div
                              className="text-sm break-words"
                              style={{
                                overflowWrap: "break-word",
                                wordBreak: "break-word",
                              }}
                            >
                              <LinkifyText text={msg.text || ""} />
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Status */}
                        <div
                          className={`text-xs text-neutral-500 flex items-center space-x-1 mt-1 ${
                            isSender ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {isSender && msg.status && (
                            <>
                              {msg.status === "read" ? (
                                <div className="flex space-x-0.5">
                                  <CheckIcon className="h-3.5 w-3.5 text-orange-200" />
                                  <CheckIcon className="h-3.5 w-3.5 text-orange-200 -ml-2" />
                                </div>
                              ) : msg.status === "delivered" ? (
                                <div className="flex space-x-0.5">
                                  <CheckIcon className="h-3.5 w-3.5 text-neutral-400" />
                                  <CheckIcon className="h-3.5 w-3.5 text-neutral-400 -ml-2" />
                                </div>
                              ) : (
                                <CheckIcon className="h-3.5 w-3.5 text-neutral-300" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {typingUsersCount > 0 && (
            <div className="flex justify-start mb-3">
              <div className="flex flex-col max-w-[75%]">
                <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 shimmer-effect" />
                  <div className="relative z-10 flex items-center space-x-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {typingUsersCount === 1
                        ? `${typingUsersNames} is typing`
                        : `${typingUsersNames} are typing`}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 ml-1">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bulk-delete toolbar */}
      {selectedMessages.length > 0 && (
        <div className="sticky bottom-0 p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 shadow-md">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              <span className="inline-flex items-center justify-center mr-2 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                {selectedMessages.length}
              </span>
              messages selected
            </span>
            <Button
              onClick={handleDeleteMessages}
              variant="destructive"
              size="sm"
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-4"
            >
              <Trash2Icon className="h-4 w-4" />
              <span className="font-medium">Unsend</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessages;