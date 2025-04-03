import { useState, useRef, useEffect, useMemo } from "react";
import { globalState } from "../jotai/globalState";
import { useAtom, useAtomValue } from "jotai";
import { fetchMessages } from "./utils/messageFetch";
import { formatMessageTime } from "./utils/timeFormat";
import { markMessageAsRead, fetchChatId } from "./utils/chatOperations";
import {
  getScrollElement,
  checkIsAtBottom,
  jumpToBottom,
  positionChat,
  saveScrollPosition,
  scrollPositionsAtom,
  setScrollPosition
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
  const initialPositionSet = useRef(false);
  const messagesRef = useRef([]);

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

  // Custom message send handler to handle instant scrolling
  const sendMessage = async (...args) => {
    const result = await handleSendMessage(...args);
    
    // After sending, instantly jump to bottom
    setTimeout(() => {
      jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom);
    }, 50);
    
    return result;
  };

  // Save scroll position when changing chats
  const handleSetActiveChat = (chatId) => {
    if (activeChat) {
      saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
    }
    setActiveChat(chatId);
    initialPositionSet.current = false;
  };
  
  useEffect(() => {
    if (!initialUsername || !user) return;
    fetchChatId(db, user, initialUsername, handleSetActiveChat);
  }, [initialUsername, user]);

  useEffect(() => {
    if (!activeChat) return;
    const unsubscribe = fetchMessages(db, activeChat, (newMessages) => {
      setMessages(newMessages);
      messagesRef.current = newMessages;
    });
    return () => unsubscribe();
  }, [activeChat]);

  // Handle positioning without animation when messages load
  useEffect(() => {
    if (!activeChat || !messages.length || !scrollAreaRef.current || initialPositionSet.current) return;
    
    // Small timeout to ensure DOM is updated
    setTimeout(() => {
      positionChat(
        scrollAreaRef, 
        activeChat, 
        messages, 
        user, 
        scrollPositions, 
        setIsAtBottom, 
        setNewMessagesCount
      );
      initialPositionSet.current = true;
    }, 50);
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
    initialPositionSet.current = false;
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

  // Handle incoming messages without animation
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current || !initialPositionSet.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const previousLength = previousMessagesLength.current;
    const currentLength = messages.length;
    
    // Only process if we have new messages
    if (currentLength > previousLength) {
      const isLastMessageFromUser = lastMessage?.sender === user.uid;
      const newCount = currentLength - previousLength;
      
      previousMessagesLength.current = currentLength;
      
      // If we're at the bottom or the message is from current user
      if (isAtBottom || isLastMessageFromUser) {
        // Directly jump to bottom without animation
        jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom);
      } 
      // Otherwise just update the new message count
      else {
        setNewMessagesCount((prev) => prev + newCount);
      }
    }
  }, [messages, user?.uid, isAtBottom]);

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
    sendMessage,
    setNewMessage,
    newMessage,
    scrollAreaRef,
    isLoading: !activeChat || !messages,
    newMessagesCount,
    scrollToBottom: () => jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom),
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