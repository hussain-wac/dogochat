import { useState, useRef, useMemo, useCallback, useEffect, use } from "react";
import { useAtomValue } from "jotai";
import { useLocation } from "react-router-dom";
import { globalState } from "../jotai/globalState";
import { formatMessageTime } from "./utils/timeFormat";
import { fetchChatId } from "./utils/chatOperations";
import useMessageHandlers from "./useMessageHandlers";
import useInfiniteScroll from "./useInfiniteScroll";
import useReadMessages from "./useReadMessages";
import useMessageScroll from "./useMessageScroll";
import useMessageLoader from "./useMessageLoader";
import { db } from "../firebase";

const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const location = useLocation();

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState(null);

  const scrollAreaRef = useRef(null);

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
    setIsAtBottom,
    selectedMessages,
    setSelectedMessages,
    setIsSelectionMode,
    setMessages,
  });

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

  const {
    sentinelRef,
    isFetchingOlderMessages
  } = useInfiniteScroll({
    scrollAreaRef,
    activeChat,
    isLoadingMore,
    hasMoreMessages,
    loadOlderMessages,
    messages,
  });
  useReadMessages({
    scrollAreaRef,
    activeChat,
    messages,
    userId: user?.uid,
    handleMarkMessageAsRead,
  });

  const { scrollToBottom } = useMessageScroll({
    scrollAreaRef,
    activeChat,
    messages,
    user,
    setIsAtBottom,
    isLoadingMore,
    isAtBottom
  });

  const handleSetActiveChat = useCallback((chatId) => {
    if (!chatId) return;

    setMessages([]);
    setActiveChat(chatId);
    setHasMoreMessages(true);
    setLastFetchedTimestamp(null);
    setIsLoadingMore(false);
  }, []);

  const sendMessage = useCallback(async (...args) => {
    const result = await handleSendMessage(...args);
    requestAnimationFrame(() => {
      scrollToBottom();
    });
    return result;
  }, [handleSendMessage, scrollToBottom]);

  const groupedMessages = useMemo(() => {
    if (!messages.length) return {};
    return messages.reduce((groups, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      groups[date] = groups[date] || [];
      groups[date].push(msg);
      return groups;
    }, {});
  }, [messages]);

  useEffect(() => {
    if (!initialUsername || !user) return;

    fetchChatId(db, user, initialUsername, (chatId) => {
      if (chatId) {
        handleSetActiveChat(chatId);
        scrollToBottom(); 
      }
    });
  }, [initialUsername, user, handleSetActiveChat, location.pathname]); 

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
    isAtBottom,
    isFetchingOlderMessages
  };
};

export default useChatWindow;
