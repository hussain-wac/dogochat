import React from "react";
import { useParams } from "react-router-dom";
import {  CardTitle } from "@/components/ui/card";
import { MessageCircleIcon, MoreVerticalIcon, ArrowLeftIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useTypingStatus from "../../../hooks/useTypingStatus";
import { useChatUser } from "../../../hooks/useChatUser";
import { Button } from "@/components/ui/button";

const ChatHeader = ({
  isOpponentOnline,
  lastOnline,
  toggleSelectionMode,
  isSelectionMode,
  chatId,
  isMobile,
  onBackClick,
}) => {
  const { username } = useParams();
  const chatUser = useChatUser(username);
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen: Unknown";
    const date = new Date(timestamp);
    return `Last seen: ${date.toLocaleString()}`;
  };

  const { typingUsersNames } = useTypingStatus(chatId);

  return (
    <div className=" px-1 py-1 sm:px-2 sm:py-2 border-b border-gray-200 dark:border-gray-800 gap-0 pb-2">
      <div className="flex items-center w-full gap-2">
        {/* Back button for mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="flex-shrink-0"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        )}
        
        {/* User avatar */}
        {chatUser?.photoURL ? (
          <img
            src={chatUser.photoURL}
            alt={chatUser.username}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-orange-200 dark:border-orange-800 shadow-sm flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <MessageCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
        )}
        
        {/* User info - grows to fill space */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <CardTitle className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
            {chatUser?.username || "User"}
          </CardTitle>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {typingUsersNames ? (
              <span className="text-green-500 flex items-center">
                <span className="flex space-x-1 mr-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-green-500 animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-green-500 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-green-500 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></span>
                </span>
                typing...
              </span>
            ) : isOpponentOnline ? (
              <span className="text-green-500 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                Online
              </span>
            ) : (
              formatLastSeen(lastOnline)
            )}
            {chatUser?.email && (
              <div className="truncate mt-0.5 hidden sm:block">{chatUser.email}</div>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 p-0"
            >
              <MoreVerticalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <DropdownMenuItem
              onClick={toggleSelectionMode}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isSelectionMode ? "Cancel Selection" : "Select Messages"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;