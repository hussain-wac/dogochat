import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, Trash2Icon } from "lucide-react";

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
}) => (
  <div className="flex flex-col h-full">
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-auto relative">
      <div className="space-y-3 pb-4">
        {isLoading ? (
          [...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-3/4" />
          ))
        ) : (
          Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="text-center text-gray-500 my-4 relative">
                <span className="bg-white dark:bg-gray-900 px-4 relative z-10">
                  {date === new Date().toDateString()
                    ? "Today"
                    : new Date(date).toLocaleDateString()}
                </span>
                <div className="absolute left-0 right-0 top-1/2 border-t dark:border-neutral-700"></div>
              </div>
              {dayMessages.map((msg) => (
                <div
                  key={msg.id}
                  data-message-id={msg.id}
                  className={`flex ${msg.sender === user.uid ? "justify-end" : "justify-start"} mb-2`}
                >
                  {isSelectionMode && msg.sender === user.uid && (
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(msg.id)}
                      onChange={() => toggleMessageSelection(msg.id)}
                      className="mr-2 self-center"
                    />
                  )}
                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`p-3 rounded-xl min-w-0 break-words ${
                        msg.sender === user.uid
                          ? "bg-orange-100 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      } ${selectedMessages.includes(msg.id) ? "opacity-50" : ""}`}
                    >
                      {msg.text}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-1 mt-1">
                      <span>{formatMessageTime(msg.timestamp)}</span>
                      {msg.sender === user.uid && (
                        <>
                          {msg.status === "read" ? (
                            <div className="flex space-x-0.5">
                              <CheckIcon className="h-4 w-4 text-orange-500" />
                              <CheckIcon className="h-4 w-4 text-orange-500 -ml-2.5" />
                            </div>
                          ) : msg.status === "delivered" ? (
                            <div className="flex space-x-0.5">
                              <CheckIcon className="h-4 w-4 text-gray-500" />
                              <CheckIcon className="h-4 w-4 text-gray-500 -ml-2.5" />
                            </div>
                          ) : (
                            <CheckIcon className="h-4 w-4 text-gray-300" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
    {selectedMessages.length > 0 && (
      <div className="p-2 bg-gray-100 dark:bg-neutral-800 flex justify-between items-center">
        <span>{selectedMessages.length} selected</span>
        <button
          onClick={handleDeleteMessages}
          className="text-red-500 flex items-center space-x-1"
        >
          <Trash2Icon className="h-5 w-5" />
          <span>Delete</span>
        </button>
      </div>
    )}
  </div>
);

export default ChatMessages;
