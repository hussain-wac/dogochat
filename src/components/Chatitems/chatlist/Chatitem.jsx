import React from "react";

import { Badge } from "@/components/ui/badge";
import { useFirebasePresence } from "../../../hooks/useFirebasePresence";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoreVertical, Trash, ImageIcon } from "lucide-react";
function ChatItem({ chat, onSelect, onDelete }) {
  const { isOnline } = useFirebasePresence(chat.name);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    }

    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isCloudinaryImage = (text) => {
    return /^https?:\/\/res\.cloudinary\.com\/.*\/image\/upload\/.*\.(jpg|jpeg|png|gif|webp)$/.test(
      text
    );
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => onSelect(chat.refid, chat.name, chat.profilePic)}
            className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer flex items-center space-x-3 transition-colors"
          >
            <div className="relative flex-shrink-0">
              {chat.profilePic ? (
                <img
                  src={chat.profilePic}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 dark:border-orange-800 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm text-white font-medium">
                  {getInitials(chat.name)}
                </div>
              )}
              {isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-neutral-900" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {chat.name}
                </div>
                {chat.lastMessage && (
                  <span className="text-xs text-neutral-500 ml-2 whitespace-nowrap">
                    {formatTimestamp(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate pr-2 flex items-center gap-1">
                  {chat.lastMessage?.type === "image" ? (
                    <>
                      <ImageIcon className="w-4 h-4 text-neutral-400" />
                      <span>Photo</span>
                    </>
                  ) : chat.lastMessage?.text?.length > 30 ? (
                    chat.lastMessage.text.substring(0, 30) + "..."
                  ) : (
                    chat.lastMessage?.text || "No messages yet"
                  )}
                </p>

                {chat.unreadCount > 0 && (
                  <Badge className="ml-2 bg-orange-500 hover:bg-orange-500 rounded-full h-5 min-w-5 flex items-center justify-center px-1.5 text-xs">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex-shrink-0">
                  <MoreVertical className="w-5 h-5 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-500 flex items-center px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  onClick={(e) => onDelete(chat.refid, e)}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">Chat with {chat.name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default ChatItem;
