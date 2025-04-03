import { useState, useRef, useEffect, useMemo } from "react";
import { globalState } from "../jotai/globalState";
import { useAtom, useAtomValue } from "jotai";
import { fetchMessages } from "./utils/messageFetch";
import { formatMessageTime } from "./utils/timeFormat";
import { markMessageAsRead, fetchChatId } from "./utils/chatOperations";
import {
  getScrollElement,
  checkIsAtBottom,
  scrollToBottom,
  smartScroll,
  saveScrollPosition,
  scrollPositionsAtom
} from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import useMessageHandlers from "./useMessageHandlers";
import { db } from "../firebase";

const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const [scrollPositions, setScrollPositions] = useAtom(scrollPositionsAtom);
 
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);
  const observerRef = useRef(null);
  const hasMarkedRead = useRef(false);
  const previousMessagesLength = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const initialScrollDone = useRef(false);

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

  // Save scroll position when changing chats
  const handleSetActiveChat = (chatId) => {
    if (activeChat) {
      saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
    }
    setActiveChat(chatId);
    initialScrollDone.current = false;
  };
  
  useEffect(() => {
    if (!initialUsername || !user) return;
    fetchChatId(db, user, initialUsername, handleSetActiveChat);
  }, [initialUsername, user]);

  useEffect(() => {
    if (!activeChat) return;
    const unsubscribe = fetchMessages(db, activeChat, setMessages);
    return () => unsubscribe();
  }, [activeChat]);

  // Handle initial scroll positioning when messages load
  useEffect(() => {
    if (!activeChat || !messages.length || !scrollAreaRef.current || initialScrollDone.current) return;
    
    // Slight delay to ensure DOM is updated
    setTimeout(() => {
      smartScroll(
        scrollAreaRef, 
        activeChat, 
        messages, 
        user, 
        scrollPositions, 
        setIsAtBottom, 
        setNewMessagesCount
      );
      initialScrollDone.current = true;
    }, 100);
  }, [messages, activeChat, user, scrollPositions]);

  useEffect(() => {
    if (!activeChat || !messages.length || hasMarkedRead.current) return;
    const unreadMessages = messages.filter(
      (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
    );
    if (unreadMessages.length > 0) {
      Promise.all(
        unreadMessages.map((msg) =>
          markMessageAsRead(db, activeChat, msg.id, user.uid)
        )
      ).then(() => {
        hasMarkedRead.current = true;
        setNewMessagesCount(0);
      });
    } else {
      hasMarkedRead.current = true;
      setNewMessagesCount(0);
    }
  }, [messages, activeChat, user.uid]);

  useEffect(() => {
    hasMarkedRead.current = false;
    initialScrollDone.current = false;
  }, [activeChat]);

  // Group messages by date
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
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = observeMessages(
      messages,
      user.uid,
      handleMarkMessageAsRead,
      scrollAreaRef
    );
    const scrollElement = getScrollElement(scrollAreaRef);
    scrollElement
      ?.querySelectorAll("[data-message-id]")
      .forEach((element) => observerRef.current.observe(element));
    return () => observerRef.current?.disconnect();
  }, [messages, activeChat, user.uid, handleMarkMessageAsRead]);

  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;
    const handleScroll = () => {
      const isBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(isBottom);
      if (isBottom) setNewMessagesCount(0);
    };
    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [activeChat, messages]);

  // Handle incoming messages
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage?.sender === user.uid;
    const newCount = messages.length - previousMessagesLength.current;
    const hasNewMessages = newCount > 0;
    
    // Update previous messages length
    previousMessagesLength.current = messages.length;
    
    // If we're already at the bottom or the message is from current user
    if (isAtBottom || isLastMessageFromUser) {
      // Auto-scroll to bottom with new messages
      scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, "smooth");
      setNewMessagesCount(0);
    } 
    // If new messages arrived and we're not at bottom
    else if (hasNewMessages && !isLastMessageFromUser) {
      setNewMessagesCount((prev) => prev + newCount);
    }
  }, [messages, user.uid, activeChat, isAtBottom]);

  // Clean up function to save scroll position when unmounting
  useEffect(() => {
    return () => {
      if (activeChat) {
        saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
      }
    };
  }, [activeChat]);

  return {
    username: initialUsername,
    activeChat,
    setActiveChat: handleSetActiveChat,
    messages,
    sendMessage: handleSendMessage,
    setNewMessage,
    newMessage,
    scrollAreaRef,
    isLoading: !activeChat || !messages,
    newMessagesCount,
    scrollToBottom: (behavior) =>
      scrollToBottom(
        scrollAreaRef,
        setNewMessagesCount,
        setIsAtBottom,
        behavior
      ),
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
  };
};

export default useChatWindow;