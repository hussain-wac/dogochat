import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircleIcon, UserIcon } from "lucide-react";
import useChatlist from "../../hooks/useChatlist";
import { useSetAtom } from "jotai";
import { chatname } from "../../jotai/globalState";
import { Skeleton } from "@/components/ui/skeleton";

function ChatList({ setActiveChat }) {
  const { chatList, isLoading } = useChatlist(setActiveChat);
  const setchatname = useSetAtom(chatname);

  return (
    <Card className="rounded-none border-none shadow-none">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="flex items-center">
          <MessageCircleIcon className="mr-2 h-5 w-5" />
          Chats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-4rem)]">
          {isLoading ? (
            // Loading Skeleton
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
                        onClick={() => {
                          setActiveChat(chat.refid);
                          setchatname(chat.name);
                        }}
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
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                          <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{chat.name}</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Last message placeholder
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Now
                        </div>
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
  );
}

export default ChatList;
