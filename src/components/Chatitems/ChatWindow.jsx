import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import useChatWindow from "../../hooks/useChatwindow";
import ChatHeader from "./ChatWinowitems/ChatHeader";
import ChatMessages from "./ChatWinowitems/ChatMessages";
import NewMessagesBadge from "./ChatWinowitems/NewMessagesBadge";
import MessageInput from "./ChatWinowitems/MessageInput";
import { MessageCircleIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function ChatWindow({ initialUsername, onBackClick }) {
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
    selectedMessages,
    toggleMessageSelection,
    handleDeleteMessages,
    isSelectionMode,
    toggleSelectionMode,
  } = useChatWindow(initialUsername);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      <div className="flex flex-col items-center justify-center text-gray-500 h-full space-y-4 p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center animate-pulse">
          <MessageCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-lg font-medium text-center">
          {username ? "Loading chat..." : "Select a chat to start messaging"}
        </p>
        <p className="text-sm text-gray-400 text-center max-w-sm">
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
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <Card className="flex flex-col h-full rounded-none border-none shadow-none overflow-hidden">
        <ChatHeader
          chatdet={chatdet}
          username={username}
          isOpponentOnline={isOpponentOnline}
          lastOnline={lastOnline}
          toggleSelectionMode={toggleSelectionMode}
          isSelectionMode={isSelectionMode}
          isMobile={isMobile}
          onBackClick={handleBackToChats}
        />
        <CardContent className="flex flex-col flex-1 p-0 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
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
            isMobile={isMobile}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default ChatWindow;