import { useState, useRef, useMemo } from "react";
import { globalState } from "../jotai/globalState";
import { useAtom, useAtomValue } from "jotai";
import { formatMessageTime } from "./utils/timeFormat";
import { fetchChatId } from "./utils/chatOperations";
import {
  saveScrollPosition,
  scrollPositionsAtom
} from "./utils/scrollUtils";
import useMessageHandlers from "./useMessageHandlers";
import useInfiniteScroll from "./useInfiniteScroll";
import useReadMessages from "./useReadMessages";
import useMessageScroll from "./useMessageScroll";
import useMessageLoader from "./useMessageLoader";
import { useEffect } from "react";
import { db } from "../firebase";

const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const [scrollPositions, setScrollPositions] = useAtom(scrollPositionsAtom);
  
  // State management
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState(null);
  
  // Refs
  const scrollAreaRef = useRef(null);

  // Message handlers hook
  const {
    handleSendMessage,
    handleMarkMessageAsRead,
    toggleMessageSelection,
    handleDeleteMessages,
    toggleSelectionMode,
  } = useMessageHandlers({
    db,
    activeChat,
    newMessage,
    setNewMessage,
    user,
    scrollAreaRef,
    setNewMessagesCount,
    setIsAtBottom,
    selectedMessages,
    setSelectedMessages,
    setIsSelectionMode,
    setMessages,
  });

  // Message loader hook
  const { messagesRef, loadOlderMessages } = useMessageLoader({
    activeChat,
    db,
    setMessages,
    setLastFetchedTimestamp,
    setHasMoreMessages,
    isLoadingMore,
    setIsLoadingMore,
    lastFetchedTimestamp,
    hasMoreMessages,
    scrollAreaRef
  });

  // Infinite scroll hook
  useInfiniteScroll({
    scrollAreaRef,
    activeChat,
    isLoadingMore,
    hasMoreMessages,
    loadOlderMessages,
    messages,
  });

  // Read messages tracking hook
  useReadMessages({
    scrollAreaRef,
    activeChat,
    messages,
    userId: user?.uid,
    handleMarkMessageAsRead,
    setNewMessagesCount
  });

  // Message scroll behavior hook
  const { scrollToBottom } = useMessageScroll({
    scrollAreaRef,
    activeChat,
    messages,
    user,
    scrollPositions,
    setIsAtBottom,
    setNewMessagesCount,
    isLoadingMore,
    isAtBottom
  });

  // Set active chat and reset states
  const handleSetActiveChat = (chatId) => {
    if (activeChat) saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
    setActiveChat(chatId);
    setMessages([]);
    setHasMoreMessages(true);
    setLastFetchedTimestamp(null);
  };
  
  // Send message with auto-scroll
  const sendMessage = async (...args) => {
    const result = await handleSendMessage(...args);
    setTimeout(scrollToBottom, 50);
    return result;
  };

  // Group messages by date (memoized)
  const groupedMessages = useMemo(() => {
    if (!messages.length) return {};
    return messages.reduce((groups, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      groups[date] = groups[date] || [];
      groups[date].push(msg);
      return groups;
    }, {});
  }, [messages]);

  // Effect: Initialize chat with username
  useEffect(() => {
    if (!initialUsername || !user) return;
    fetchChatId(db, user, initialUsername, handleSetActiveChat);
  }, [initialUsername, user]);

  // Effect: Save scroll position on unmount
  useEffect(() => {
    return () => {
      if (activeChat) {
        saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
      }
    };
  }, [activeChat, setScrollPositions]);

  return {
    username: initialUsername,
    activeChat,
    setActiveChat: handleSetActiveChat,
    messages,
    sendMessage,
    setNewMessage,
    newMessage,
    scrollAreaRef,
    isLoading: !activeChat || messages.length === 0,
    newMessagesCount,
    scrollToBottom,
    groupedMessages,
    formatMessageTime,
    user,
    isAtBottom,
    markMessageAsRead: handleMarkMessageAsRead,
    selectedMessages,
    toggleMessageSelection,
    handleDeleteMessages,
    isSelectionMode,
    toggleSelectionMode,
    isLoadingMore,
    hasMoreMessages,
    loadOlderMessages,
  };
};

export default useChatWindow;