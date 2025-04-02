import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatHeader = ({
  chatdet,
  username,
  isOpponentOnline,
  lastOnline,
  toggleSelectionMode,
  isSelectionMode,
}) => {
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen: Unknown";
    const date = new Date(timestamp);
    return `Last seen: ${date.toLocaleString()}`;
  };

  return (
    <CardHeader className="border-b dark:border-neutral-700 h-16 min-h-[4rem] sticky top-0 z-10 bg-white dark:bg-neutral-900 px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {chatdet.profilePic ? (
          <img
            src={chatdet.profilePic}
            alt={chatdet.chatname}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 dark:border-orange-800 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
            <MessageCircleIcon className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            {chatdet.chatname || username}
          </CardTitle>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            {isOpponentOnline ? (
              <span className="text-green-500 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                Online
              </span>
            ) : (
              formatLastSeen(lastOnline)
            )}
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreVerticalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 shadow-lg border border-gray-200 dark:border-gray-700">
          <DropdownMenuItem 
            onClick={toggleSelectionMode}
            className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isSelectionMode ? "Cancel Selection" : "Select Messages"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardHeader>
  );
};

export default ChatHeader;