import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, Trash2Icon } from "lucide-react";
import useTypingStatus from "../../../hooks/useTypingStatus";

const ChatMessages = ({
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
}) => {
  const { typingUsersCount, typingUsersNames } = useTypingStatus(chatId);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-4 py-2"
        style={{ overflowY: "auto" }}
      >
        <div className="space-y-4 pb-6">
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"} mb-4`}
              >
                <div className="flex flex-col max-w-[70%]">
                  <Skeleton
                    className={`h-12 ${index % 2 === 0 ? "w-64" : "w-48"} rounded-xl`}
                  />
                  <Skeleton className="h-3 w-16 mt-1 ml-auto" />
                </div>
              </div>
            ))
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date} className="space-y-3">
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
                {dayMessages.map((msg) => {
                  const isSender = msg.sender === user.uid;
                  return (
                    <div
                      key={msg.id}
                      data-message-id={msg.id}
                      className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3 group`}
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
                      <div
                        className={`flex flex-col max-w-[70%] ${
                          selectedMessages.includes(msg.id) ? "opacity-60" : ""
                        }`}
                      >
                        <div
                          className={`
                          p-3 rounded-2xl shadow-sm
                          ${
                            isSender
                              ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-tr-none"
                              : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-700"
                          }
                        `}
                        >
                          <div className="text-sm whitespace-pre-wrap break-words">
                            {msg.text}
                          </div>
                        </div>
                        <div
                          className={`text-xs text-neutral-500 flex items-center space-x-1 mt-1 ${
                            isSender ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {isSender && (
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

          {/* Enhanced Typing Indicator with Shimmer Effect */}
          {typingUsersCount > 0 && (
            <div className="flex justify-start mb-3">
              <div className="flex flex-col max-w-[70%]">
                <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden relative">
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="shimmer-effect"></div>
                  </div>
                  
                  <div className="flex items-center space-x-3 relative z-10">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      {typingUsersCount === 1
                        ? `${typingUsersNames} is typing`
                        : `${typingUsersNames} are typing`}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-neutral-500 mt-1 ml-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* CSS for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .shimmer-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
        }
        
        :global(.dark) .shimmer-effect {
          background: linear-gradient(
            90deg,
            rgba(50, 50, 50, 0) 0%,
            rgba(50, 50, 50, 0.3) 50%,
            rgba(50, 50, 50, 0) 100%
          );
        }
      `}</style>

      {selectedMessages.length > 0 && (
        <div className="sticky bottom-0 p-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 shadow-md">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              <span className="inline-flex items-center justify-center mr-2 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                {selectedMessages.length}
              </span>
              messages selected
            </span>
            <button
              onClick={handleDeleteMessages}
              className="text-red-500 flex items-center space-x-2 px-4 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2Icon className="h-4 w-4" />
              <span className="font-medium">Unsend</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;