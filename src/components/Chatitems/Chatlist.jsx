// ChatList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleIcon, MoreVertical, Trash, UserPlus } from "lucide-react";
import useChatList from "../../hooks/useChatlist";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirebasePresence } from "../../hooks/useFirebasePresence"; 

// ChatItem component
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate pr-2">
                  {chat.lastMessage?.text?.length > 30
                    ? chat.lastMessage.text.substring(0, 30) + "..."
                    : chat.lastMessage?.text || "No messages yet"}
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
              <DropdownMenuContent
                align="end"
                className="w-40 shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <DropdownMenuItem
                  className="text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center cursor-pointer px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={(e) => onDelete(chat.refid, e)}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-neutral-800 text-white border-none px-2 py-1 text-sm shadow-md"
        >
          Chat with {chat.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ChatList({ setActiveChat }) {
  const { chatList, isLoading, deleteChat } = useChatList();

  const [open, setOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const navigate = useNavigate();

  const confirmDelete = (refid, e) => {
    e.stopPropagation();
    setChatToDelete(refid);
    setOpen(true);
  };

  const handleChatSelect = (refid, name) => {
    setActiveChat(refid, name);
    navigate(`/home/${name}`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      <Card className="flex flex-col h-full border-none shadow-none">
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatList.length > 0 ? (
              <div className="divide-y dark:divide-neutral-800">
                {chatList.map((chat) => (
                  <ChatItem
                    key={chat.refid}
                    chat={chat}
                    onSelect={handleChatSelect}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <MessageCircleIcon className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-neutral-600 dark:text-neutral-300 mb-2 font-medium">
                  No chats yet
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                  Start a new conversation by searching for users
                </p>
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2">
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-xl rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Delete Chat?
            </DialogTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              This will permanently delete all messages in this chat.
            </p>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:gap-0 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full sm:w-auto border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (chatToDelete) deleteChat(chatToDelete);
                setOpen(false);
                navigate("/home");
              }}
              className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChatList;
