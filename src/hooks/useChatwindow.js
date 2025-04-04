import { useState, useRef, useEffect, useMemo } from "react";
import { globalState } from "../jotai/globalState";
import { useAtom, useAtomValue } from "jotai";
import { fetchMessages, fetchOlderMessages } from "./utils/messageFetch";
import { formatMessageTime } from "./utils/timeFormat";
import { markMessageAsRead, fetchChatId } from "./utils/chatOperations";
import {
  getScrollElement,
  checkIsAtBottom,
  jumpToBottom,
  positionChat,
  saveScrollPosition,
  scrollPositionsAtom
} from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import useMessageHandlers from "./useMessageHandlers";
import useInfiniteScroll from "./useInfiniteScroll";
import { db } from "../firebase";

const MESSAGES_PER_PAGE = 20;

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
  const observerRef = useRef(null);
  const hasMarkedRead = useRef(false);
  const previousMessagesLength = useRef(0);
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

  // Set active chat and reset states
  const handleSetActiveChat = (chatId) => {
    if (activeChat) saveScrollPosition(scrollAreaRef, activeChat, setScrollPositions);
    setActiveChat(chatId);
    initialPositionSet.current = false;
    setMessages([]);
    setHasMoreMessages(true);
    setLastFetchedTimestamp(null);
  };
  
  // Send message with auto-scroll
  const sendMessage = async (...args) => {
    const result = await handleSendMessage(...args);
    setTimeout(() => jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom), 50);
    return result;
  };

  // Load older messages function
  const loadOlderMessages = async () => {
    if (!activeChat || isLoadingMore || !hasMoreMessages || !lastFetchedTimestamp) return;
    
    setIsLoadingMore(true);
    try {
      const { olderMessages, oldestTimestamp } = await fetchOlderMessages(
        db, activeChat, lastFetchedTimestamp, MESSAGES_PER_PAGE
      );

      if (olderMessages.length > 0) {
        // Save current scroll position
        const scrollElement = getScrollElement(scrollAreaRef);
        const scrollHeight = scrollElement?.scrollHeight || 0;
        const scrollTop = scrollElement?.scrollTop || 0;
        
        // Update messages
        setMessages(prev => [...olderMessages, ...prev]);
        messagesRef.current = [...olderMessages, ...messagesRef.current];
        setLastFetchedTimestamp(oldestTimestamp);
        setHasMoreMessages(olderMessages.length >= MESSAGES_PER_PAGE);
        
        // Restore scroll position
        setTimeout(() => {
          if (scrollElement) {
            scrollElement.scrollTop = scrollTop + (scrollElement.scrollHeight - scrollHeight);
          }
        }, 50);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initialize infinite scroll hook
  useInfiniteScroll({
    scrollAreaRef,
    activeChat,
    isLoadingMore,
    hasMoreMessages,
    loadOlderMessages,
    messages,
  });

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

  // Effect: Subscribe to messages
  useEffect(() => {
    if (!activeChat) return;
    const unsubscribe = fetchMessages(db, activeChat, MESSAGES_PER_PAGE, (newMessages, oldestTimestamp) => {
      setMessages(newMessages);
      messagesRef.current = newMessages;
      setLastFetchedTimestamp(oldestTimestamp);
      setHasMoreMessages(newMessages.length >= MESSAGES_PER_PAGE);
    });
    return () => unsubscribe();
  }, [activeChat]);

  // Effect: Setup scroll handler for new messages badge
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat) return;
    
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;
    
    const handleScroll = () => {
      // Check bottom for new messages badge
      const isBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(isBottom);
      if (isBottom) setNewMessagesCount(0);
    };
    
    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [activeChat]);

  // Effect: Initial positioning
  useEffect(() => {
    if (!activeChat || !messages.length || !scrollAreaRef.current || initialPositionSet.current) return;
    
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

  // Effect: Mark unread messages as read
  useEffect(() => {
    if (!activeChat || !messages.length || hasMarkedRead.current) return;
    
    const unreadMessages = messages.filter(
      msg => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
    );
    
    if (unreadMessages.length > 0) {
      Promise.all(
        unreadMessages.map(msg => markMessageAsRead(db, activeChat, msg.id, user.uid))
      ).then(() => {
        hasMarkedRead.current = true;
        setNewMessagesCount(0);
      });
    } else {
      hasMarkedRead.current = true;
      setNewMessagesCount(0);
    }
  }, [messages, activeChat, user?.uid]);

  // Effect: Reset refs on chat change
  useEffect(() => {
    hasMarkedRead.current = false;
    initialPositionSet.current = false;
  }, [activeChat]);

  // Effect: Setup message intersection observer
  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = observeMessages(
      messages,
      user.uid,
      handleMarkMessageAsRead,
      scrollAreaRef
    );
    
    getScrollElement(scrollAreaRef)
      ?.querySelectorAll("[data-message-id]")
      .forEach(element => observerRef.current.observe(element));
      
    return () => observerRef.current?.disconnect();
  }, [messages, activeChat, user?.uid, handleMarkMessageAsRead]);

  // Effect: Handle new messages and scroll
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current || !initialPositionSet.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const previousLength = previousMessagesLength.current;
    const currentLength = messages.length;
    
    if (currentLength > previousLength && !isLoadingMore) {
      const isLastMessageFromUser = lastMessage?.sender === user.uid;
      const newCount = currentLength - previousLength;
      
      previousMessagesLength.current = currentLength;
      
      if (isAtBottom || isLastMessageFromUser) {
        jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom);
      } else {
        setNewMessagesCount(prev => prev + newCount);
      }
    } else if (!isLoadingMore) {
      previousMessagesLength.current = currentLength;
    }
  }, [messages, user?.uid, isAtBottom, isLoadingMore]);

  // Effect: Save scroll position on unmount
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
    isLoading: !activeChat || messages.length === 0,
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
    isLoadingMore,
    hasMoreMessages,
    loadOlderMessages,
  };
};

export default useChatWindow;