import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import useChatWindow from "../../hooks/useChatwindow";
import ChatHeader from "./ChatWinowitems/ChatHeader";
import ChatMessages from "./ChatWinowitems/ChatMessages";
import NewMessagesBadge from "./ChatWinowitems/NewMessagesBadge";
import MessageInput from "./ChatWinowitems/MessageInput";

function ChatWindow({ initialUsername }) {
  const {
    username,
    activeChat,
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
    isOpponentOnline,
    lastOnline,
  } = useChatWindow(initialUsername);

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
        <ChatHeader
          chatdet={chatdet}
          username={username}
          isOpponentOnline={isOpponentOnline}
          lastOnline={lastOnline}
        />
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
          <ChatMessages
            scrollAreaRef={scrollAreaRef}
            isLoading={isLoading}
            groupedMessages={groupedMessages}
            user={user}
            formatMessageTime={formatMessageTime}
          />
          <NewMessagesBadge
            newMessagesCount={newMessagesCount}
            scrollToBottom={scrollToBottom}
          />
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            handleEmojiClick={handleEmojiClick}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatWindow;