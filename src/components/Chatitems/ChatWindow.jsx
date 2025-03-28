import React from "react";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useChatWindow from "../../hooks/useChatwindow";

function ChatWindow() {
  const {
    username,
    activeChat,
    messages,
    sendMessage,
    setNewMessage,
    newMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
    scrollAreaRef,
    isLoading,
    chatdet,
    newMessagesCount,
    scrollToBottom,
    groupedMessages,
    formatMessageTime,
    user,
  } = useChatWindow();

  if (!username || !activeChat) {
    return (
      <div className="flex items-center justify-center text-gray-500 h-full">
        {username ? "Loading chat..." : "Select a chat to start messaging"}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full rounded-none border-none shadow-none">
        {/* Header */}
        <CardHeader className="border-b dark:border-neutral-700 flex flex-row items-center space-x-3 h-16 min-h-[4rem] sticky top-0 z-10 bg-white dark:bg-neutral-900">
          {chatdet.profilePic ? (
            <img
              src={chatdet.profilePic}
              alt={chatdet.chatname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
              <MessageCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </div>
          )}
          <CardTitle>{chatdet.chatname || username}</CardTitle>
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
                        <div className="absolute left-0 right-0 top-1/2 border-t dark:border-neutral-700"></div>
                      </div>
                      {dayMessages.map((msg) => (
                        <div
                          key={msg.id}
                          data-message-id={msg.id} // Added data-message-id attribute
                          className={`flex flex-col ${
                            msg.sender === user.uid
                              ? "items-end"
                              : "items-start"
                          } mb-2`}
                        >
                          <div
                            className={`p-3 rounded-xl max-w-[70%] ${
                              msg.sender === user.uid
                                ? "bg-orange-100 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100"
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
                                    <CheckIcon className="h-4 w-4 text-orange-500" />
                                    <CheckIcon className="h-4 w-4 text-orange-500 -ml-2.5" />
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
                  className="rounded-full bg-orange-500 text-white flex items-center space-x-2"
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
                className="flex-1 border-orange-500"
              />

              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className={`
    flex items-center justify-center
    px-4 py-2
    rounded-full
    bg-orange-500 hover:bg-orange-600
    dark:bg-[#00A884] dark:hover:bg-[#008F72]
    text-white
    font-medium
    transition-colors duration-200
    disabled:bg-gray-300 disabled:text-gray-500
    disabled:dark:bg-gray-600 disabled:dark:text-gray-400
    disabled:cursor-not-allowed
    w-full sm:w-auto
    shadow-sm hover:shadow-md
  `}
              >
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
