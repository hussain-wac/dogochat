import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import useChatWindow from "../../hooks/useChatwindow";
import ChatHeader from "./ChatWinowitems/ChatHeader";
import ChatMessages from "./ChatWinowitems/ChatMessages";
import NewMessagesBadge from "./ChatWinowitems/NewMessagesBadge";
import MessageInput from "./ChatWinowitems/MessageInput";
import { MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFirebasePresence } from "../../hooks/useFirebasePresence";

function ChatWindow({ initialUsername, onBackClick }) {
  const {
    username,
    activeChat,
    sendMessage,
    setNewMessage,
    newMessage,
    scrollAreaRef,
    isLoading,
    newMessagesCount,
    scrollToBottom,
    groupedMessages,
    formatMessageTime,
    user,
    selectedMessages,
    toggleMessageSelection,
    handleDeleteMessages,
    isSelectionMode,
    toggleSelectionMode,
    isLoadingMore,
    hasMoreMessages,
  } = useChatWindow(initialUsername);

  const presence = useFirebasePresence(initialUsername);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackToChats = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate("/home");
    }
  };

  if (!username || !activeChat) {
    return (
      <div className="flex flex-col items-center justify-center text-neutral-500 h-full space-y-4 p-8 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center animate-pulse">
          <MessageCircleIcon className="h-8 w-8 text-neutral-400 dark:text-neutral-600" />
        </div>
        <p className="text-lg font-medium text-center">
          {username ? "Loading chat..." : "Select a chat to start messaging"}
        </p>
        <p className="text-sm text-neutral-400 text-center max-w-sm">
          {username
            ? "Just a moment while we load your conversation..."
            : "Choose from your existing chats or search for users to start a new conversation"}
        </p>
        {isMobile && (
          <Button
            onClick={handleBackToChats}
            className="mt-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4"
          >
            <MessageCircleIcon className="h-4 w-4 mr-2" />
            View Chats
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-neutral">
      <Card className="flex flex-col h-full rounded-none border-none shadow-none overflow-hidden">
        <ChatHeader
          username={username}
          isOpponentOnline={presence.isOnline}
          lastOnline={presence.lastSeen}
          toggleSelectionMode={toggleSelectionMode}
          isSelectionMode={isSelectionMode}
          isMobile={isMobile}
          onBackClick={handleBackToChats}
          chatId={activeChat}
        />
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden bg-neutral-50 dark:bg-neutral-900 relative">
          <ChatMessages
            scrollAreaRef={scrollAreaRef}
            isLoading={isLoading}
            groupedMessages={groupedMessages}
            user={user}
            formatMessageTime={formatMessageTime}
            selectedMessages={selectedMessages}
            toggleMessageSelection={toggleMessageSelection}
            handleDeleteMessages={handleDeleteMessages}
            isSelectionMode={isSelectionMode}
            chatId={activeChat}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
          />
          <NewMessagesBadge
            newMessagesCount={newMessagesCount}
            scrollToBottom={scrollToBottom}
          />
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={sendMessage}
            chatId={activeChat} 
            isMobile={isMobile} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatWindow;
