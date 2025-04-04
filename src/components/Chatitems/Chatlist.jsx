import React, { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleIcon, MoreVertical, Trash, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";

function ChatItem({ chat, onSelect, onDelete }) {
  const { isOnline } = useFirebasePresence(chat.name);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

    return messageDate.toLocaleDateString([], { month: "short", day: "numeric" });
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
        <TooltipContent side="right">
          Chat with {chat.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const EmptyStateSkeleton = () => (
  <div className="divide-y dark:divide-neutral-800">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="p-3 flex items-center space-x-3">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
);

const NoSearchResults = ({ query }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <Search className="h-12 w-12 text-neutral-400 mb-4" />
    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
      No results found
    </h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
      We couldn't find any chats matching "{query}"
    </p>
  </div>
);

const ChatList = forwardRef(({ setActiveChat, isSearching }, ref) => {
  const { chatList, isLoading, deleteChat } = useChatList();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    setSearchQuery: (query) => setSearchQuery(query),
    clearSearch: () => setSearchQuery(""),
  }));

  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    return chatList.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatList, searchQuery]);

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
      {isSearching && (
        <div className="px-3 py-2 border-b dark:border-neutral-800 flex items-center">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
            <X className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
      )}

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
            ) : filteredChatList.length > 0 ? (
              <div className="divide-y dark:divide-neutral-800">
                {filteredChatList.map(chat => (
                  <ChatItem
                    key={chat.refid}
                    chat={chat}
                    onSelect={handleChatSelect}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            ) : searchQuery.trim() !== "" ? (
              <NoSearchResults query={searchQuery} />
            ) : (
              <EmptyStateSkeleton />
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Chat?</DialogTitle>
            <p className="text-sm text-neutral-500">
              This will permanently delete all messages in this chat.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (chatToDelete) deleteChat(chatToDelete);
                setOpen(false);
                navigate("/home");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ChatList;
