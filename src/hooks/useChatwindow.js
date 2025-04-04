import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useLocation } from "react-router-dom"; // Add this import
import { globalState } from "../jotai/globalState";
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
import { db } from "../firebase";

const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const [scrollPositions, setScrollPositions] = useAtom(scrollPositionsAtom);
  const location = useLocation(); // Add this to track route changes

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
    setNewMessagesCount,
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

  useInfiniteScroll({
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
    setNewMessagesCount
  });

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

  const handleSetActiveChat = useCallback((chatId) => {
    if (!chatId) return;

    if (activeChat) {
      saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
    }

    console.log("[useChatWindow] Switching to chat:", chatId);

    setMessages([]);
    setActiveChat(chatId);
    setHasMoreMessages(true);
    setLastFetchedTimestamp(null);
    setIsLoadingMore(false);
    setNewMessagesCount(0);
  }, [activeChat, scrollAreaRef, setScrollPositions]);

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

  // Initial load of chatId and reset on route change
  useEffect(() => {
    if (!initialUsername || !user) return;

    console.log("[useChatWindow] Fetching chatId for:", initialUsername);

    fetchChatId(db, user, initialUsername, (chatId) => {
      if (chatId) {
        handleSetActiveChat(chatId);
        scrollToBottom(); // Ensure we scroll to the bottom after setting the chat
      }
    });
  }, [initialUsername, user, handleSetActiveChat, location.pathname]); // Add location.pathname as a dependency

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