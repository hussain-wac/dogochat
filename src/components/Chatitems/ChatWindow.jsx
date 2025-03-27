import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  SendHorizontalIcon,
  MessageCircleIcon,
  SmileIcon,
  PaperclipIcon,
  ChevronDownIcon,
} from "lucide-react";
import useChatWindow from "../../hooks/useChatwindow";
import { Skeleton } from "@/components/ui/skeleton";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    handleScroll,
    scrollToBottom,
  } = useChatWindow(activeChat);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

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
        {/* Fixed Header */}
        <CardHeader
          className="
            border-b dark:border-gray-700 
            flex flex-row items-center space-x-3 
            h-16 min-h-[4rem] 
            sticky top-0 z-10 
            bg-white dark:bg-gray-900
          "
        >
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

        {/* Main Content */}
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          {/* Messages Area */}
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 p-4 overflow-auto relative"
            onScroll={handleScroll}
          >
            <div className="space-y-3 pb-4">
              {isLoading
                ? [...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-10 w-3/4" />
                  ))
                : messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        msg.sender === user.uid
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                        p-3 rounded-xl max-w-[70%] mt-2
                        ${
                          msg.sender === user.uid
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        }
                      `}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
            </div>

            {/* New Messages Badge with Down Arrow */}
            {newMessagesCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="sticky bottom-4 flex justify-center"
              >
                <Button
                  variant="outline"
                  className="rounded-full bg-blue-500 text-white flex items-center space-x-2"
                  onClick={() => scrollToBottom("smooth")}
                >
                  <span>New Messages ({newMessagesCount})</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </ScrollArea>

          {/* Fixed Input Area */}
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