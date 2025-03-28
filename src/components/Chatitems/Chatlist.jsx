import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleIcon, MoreVertical, Trash } from "lucide-react";
import useChatList from "../../hooks/useChatlist";
import { useSetAtom } from "jotai";
import { chatdetails } from "../../jotai/globalState";
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

function ChatList({ setActiveChat }) {
  const { chatList, isLoading, deleteChat } = useChatList();
  const setChatdet = useSetAtom(chatdetails);
  const [open, setOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const navigate = useNavigate();

  console.log("ChatList data:", chatList); // Debug: Check unreadCount values

  const confirmDelete = (refid) => {
    setChatToDelete(refid);
    setOpen(true);
  };

  const handleChatSelect = (refid, name, profilePic) => {
    setActiveChat(refid, name); // Set active chat and username
    setChatdet({ chatname: name, profilePic });
    navigate(`/home/${name}`); // Navigate to the chat route
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="rounded-none border-none shadow-none flex flex-col h-full">
        <CardHeader className="border-b dark:border-gray-700 shrink-0">
          <CardTitle className="flex items-center">
            <MessageCircleIcon className="mr-2 h-5 w-5" />
            Chats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chatList.length > 0 ? (
              <div className="divide-y dark:divide-gray-700">
                {chatList.map((chat) => (
                  <TooltipProvider key={chat.refid}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() =>
                            handleChatSelect(chat.refid, chat.name, chat.profilePic)
                          }
                          className="
                            p-4 
                            hover:bg-gray-100 
                            dark:hover:bg-gray-800 
                            cursor-pointer 
                            flex 
                            items-center 
                            space-x-3 
                            transition-colors
                          "
                        >
                          {chat.profilePic ? (
                            <img
                              src={chat.profilePic}
                              alt={chat.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <MessageCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                            </div>
                          )}

                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold truncate">
                                {chat.name}
                              </div>
                              {chat.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(chat.lastMessage.timestamp)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {chat.lastMessage?.text || "No messages yet"}
                              </p>
                              {chat.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2">
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-red-500 flex items-center"
                                onClick={() => confirmDelete(chat.refid)}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Chat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Start chatting with {chat.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No chats available
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat?</DialogTitle>
            <p className="text-gray-500">This action cannot be undone.</p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (chatToDelete) {
                  deleteChat(chatToDelete);
                }
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
}

export default ChatList;