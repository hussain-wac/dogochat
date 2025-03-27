import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontalIcon, UserIcon, MessageCircleIcon } from "lucide-react";
import useChatWindow from "../../hooks/useChatwindow";

function ChatWindow({ activeChat }) {
  const {
    messages,
    sendMessage,
    setNewMessage,
    scrollAreaRef,
    newMessage,
    user,chatnameval
  } = useChatWindow(activeChat);



  return (
    <Card className="h-full rounded-none border-none shadow-none flex flex-col">
      <CardHeader className="border-b dark:border-gray-700 flex flex-row items-center space-x-3">
        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
          <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </div>
        <CardTitle>{chatnameval}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-4 space-y-3 overflow-y-auto"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === user.uid ? "justify-end" : "justify-start"
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
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-2">
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
  );
}

export default ChatWindow;
