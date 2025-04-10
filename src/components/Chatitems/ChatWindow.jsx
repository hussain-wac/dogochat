// src/components/ChatWindow.jsx
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import useChatWindow from "../../hooks/useChatwindow";
import ChatHeader from "./ChatWinowitems/ChatHeader";
import ChatMessages from "./ChatWinowitems/ChatMessages";
import NewMessagesBadge from "./ChatWinowitems/NewMessagesBadge";
import MessageInput from "./ChatWinowitems/MessageInput";
import { useNavigate } from "react-router-dom";
import { useFirebasePresence } from "../../hooks/useFirebasePresence";
import useReadMessages from "../../hooks/useReadMessages"; 
import { db } from "../../firebase"; 

function ChatWindow({ initialUsername, onBackClick }) {
  const {
    username,
    activeChat,
    sendMessage,
    setNewMessage,
    newMessage,
    scrollAreaRef,
    isLoading,
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
    isAtBottom,
    isFetchingOlderMessages,
  } = useChatWindow(initialUsername);

  const presence = useFirebasePresence(initialUsername);
  const isMobile = window.innerWidth < 768;
  const navigate = useNavigate();

  const { markAsRead } = useReadMessages({
    db, // Your Firestore instance
    scrollAreaRef,
    activeChat,
    messages: Object.values(groupedMessages).flat(), 
    userId: user?.uid,
    handleMarkMessageAsRead: (messageId) => {
    },
  });

  const handleBackToChats = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate("/home");
    }
  };

  return (
    <div className="bg-neutral-100 dark:bg-neutral-neutral">
      <Card className="flex flex-col rounded-none border-none shadow-none  gap-0 py-2 h-[92%] md:h-[90%] lg:h-[95%]">
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
      
        <CardContent className="p-0  bg-neutral-50 dark:bg-neutral-900 relative h-full">
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
            isFetchingOlderMessages={isFetchingOlderMessages}
          />
          <NewMessagesBadge
            scrollToBottom={scrollToBottom}
            isAtBottom={isAtBottom}
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