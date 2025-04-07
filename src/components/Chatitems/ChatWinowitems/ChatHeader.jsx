import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CardHeader, CardTitle } from "@/components/ui/card";
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
  const navigate = useNavigate();
  const chatUser = useChatUser(username);
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen: Unknown";
    const date = new Date(timestamp);
    return `Last seen: ${date.toLocaleString()}`;
  };

  const { typingUsersNames } = useTypingStatus(chatId);

  return (
    <CardHeader className="border-b dark:border-neutral-700 h-16 min-h-[4rem] sticky top-0 z-10 bg-white dark:bg-neutral-900 px-4 py-3 shadow-sm flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="mr-2"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
        )}
        {chatUser?.photoURL ? (
          <img
            src={chatUser.photoURL}
            alt={chatUser.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200 dark:border-orange-800 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
            <MessageCircleIcon className="h-5 w-5 text-white" />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            {chatUser?.username || "User"}
          </CardTitle>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            {typingUsersNames ? (
              <span className="text-green-500 flex items-center">
                <span className="flex space-x-1 mr-1.5">
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
          </span>
          {chatUser?.email && (
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {chatUser.email}
            </span>
          )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreVerticalIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
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
    </CardHeader>
  );
};

export default ChatHeader;