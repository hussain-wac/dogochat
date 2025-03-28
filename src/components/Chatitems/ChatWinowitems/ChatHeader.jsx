import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon } from "lucide-react";

const ChatHeader = ({ chatdet, username, isOpponentOnline, lastOnline }) => {
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen: Unknown";
    const date = new Date(timestamp);
    return `Last seen: ${date.toLocaleString()}`;
  };

  return (
    <CardHeader className="border-b dark:border-neutral-700 flex flex-row items-center space-x-3 h-16 min-h-[4rem] sticky top-0 z-10 bg-white dark:bg-neutral-900">
      {chatdet.profilePic ? (
        <img
          src={chatdet.profilePic}
          alt={chatdet.chatname}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
          <MessageCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
        </div>
      )}
      <div className="flex flex-col">
        <CardTitle>{chatdet.chatname || username}</CardTitle>
        <span className="text-sm text-gray-500">
          {isOpponentOnline ? (
            <span className="text-green-500">Online</span>
          ) : (
            formatLastSeen(lastOnline)
          )}
        </span>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;