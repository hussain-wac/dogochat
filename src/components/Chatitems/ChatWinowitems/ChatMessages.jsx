// ChatMessages.jsx
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon } from "lucide-react";

const ChatMessages = ({
  scrollAreaRef,
  isLoading,
  groupedMessages,
  user,
  formatMessageTime,
}) => (
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
                className={`flex flex-col ${
                  msg.sender === user.uid ? "items-end" : "items-start"
                } mb-2`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[70%] ${
                    msg.sender === user.uid
                      ? "bg-orange-100 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
                <div
                  className={`text-xs text-gray-500 flex items-center space-x-1 mt-1 ${
                    msg.sender === user.uid ? "justify-end" : "justify-start"
                  }`}
                >
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
            ))}
          </div>
        ))
      )}
    </div>
  </ScrollArea>
);

export default ChatMessages;