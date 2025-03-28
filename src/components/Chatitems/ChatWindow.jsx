import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SendHorizontalIcon,
  MessageCircleIcon,
  SmileIcon,
  PaperclipIcon,
  ChevronDownIcon,
  CheckIcon,
  EyeIcon,
} from "lucide-react";
import useChatWindow from "../../hooks/useChatwindow";
import { Skeleton } from "@/components/ui/skeleton";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formatMessageTime = (timestamp) => {
  const date =
    timestamp instanceof Date
      ? timestamp
      : typeof timestamp === "string"
      ? new Date(timestamp)
      : timestamp.toDate();

  const now = new Date();
  const diffSeconds = (now.getTime() - date.getTime()) / 1000;

  if (diffSeconds < 30) return "Just now";
  if (diffSeconds < 60) return "1 min ago";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;

  const hours = Math.floor(diffSeconds / 3600);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

function ChatWindow({ activeChat }) {
  const {
    messages,
    sendMessage,
    setNewMessage,
    scrollAreaRef,
    newMessage,
    user,
    isLoading,
    chatdet,
    newMessagesCount,
    scrollToBottom,
  } = useChatWindow(activeChat);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((msg) => {
      const date = msg.timestamp.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center text-gray-500 h-full">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full rounded-none border-none shadow-none">
        {/* Header */}
        <CardHeader className="border-b dark:border-gray-700 flex flex-row items-center space-x-3 h-16 min-h-[4rem] sticky top-0 z-10 bg-white dark:bg-gray-900">
          {chatdet.profilePic ? (
            <img
              src={chatdet.profilePic}
              alt={chatdet.chatname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <MessageCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </div>
          )}
          <CardTitle>{chatdet.chatname}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 p-4 overflow-auto relative"
          >
            <div className="space-y-3 pb-4">
              {isLoading
                ? [...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-10 w-3/4" />
                  ))
                : Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                      <div className="text-center text-gray-500 my-4 relative">
                        <span className="bg-white dark:bg-gray-900 px-4 relative z-10">
                          {date === new Date().toDateString()
                            ? "Today"
                            : new Date(date).toLocaleDateString()}
                        </span>
                        <div className="absolute left-0 right-0 top-1/2 border-t dark:border-gray-700"></div>
                      </div>
                      {dayMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.sender === user.uid
                              ? "items-end"
                              : "items-start"
                          } mb-2`}
                        >
                          <div
                            className={`p-3 rounded-xl max-w-[70%] ${
                              msg.sender === user.uid
                                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div
                            className={`text-xs text-gray-500 flex items-center space-x-1 mt-1 ${
                              msg.sender === user.uid
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <span>{formatMessageTime(msg.timestamp)}</span>
                            {msg.sender === user.uid && (
                              <>
                                {msg.status === "read" ? (
                                  <div className="flex space-x-0.5">
                                    <CheckIcon className="h-4 w-4 text-blue-500" />
                                    <CheckIcon className="h-4 w-4 text-blue-500 -ml-2.5" />
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
                  ))}
            </div>

            {/* New Messages Badge */}
            {newMessagesCount > 0 && (
              <div className="sticky bottom-4 flex justify-center animate-bounce">
                <Button
                  variant="outline"
                  className="rounded-full bg-blue-500 text-white flex items-center space-x-2"
                  onClick={() => scrollToBottom("smooth")}
                >
                  <span>New Messages ({newMessagesCount})</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-2 border-t dark:border-gray-700 shrink-0">
            <div className="flex space-x-2 items-center">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <SmileIcon className="h-5 w-5 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-auto p-0 border-none">
                  <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="mr-2">
                <PaperclipIcon className="h-5 w-5 text-gray-500" />
              </Button>

              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />

              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <SendHorizontalIcon className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatWindow;
