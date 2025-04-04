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
  scrollPositionsAtom,
  setScrollPosition
} from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import useMessageHandlers from "./useMessageHandlers";
import { db } from "../firebase";

const MESSAGES_PER_PAGE = 20; // Number of messages to load per fetch

const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const [scrollPositions, setScrollPositions] = useAtom(scrollPositionsAtom);
 
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreObserverRef = useRef(null);
  const sentinelRef = useRef(null);
  const hasMarkedRead = useRef(false);
  const previousMessagesLength = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const initialPositionSet = useRef(false);
  const messagesRef = useRef([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState(null);

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
    setMessages([]);
    setHasMoreMessages(true);
    setLastFetchedTimestamp(null);
  };
  
  useEffect(() => {
    if (!initialUsername || !user) return;
    fetchChatId(db, user, initialUsername, handleSetActiveChat);
  }, [initialUsername, user]);

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

  // Create and add sentinel element for infinite scroll
  const createSentinelElement = () => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return null;
    
    // Remove existing sentinel if any
    const existingSentinel = scrollElement.querySelector('.messages-sentinel');
    if (existingSentinel) {
      existingSentinel.remove();
    }
    
    // Create new sentinel
    const sentinel = document.createElement('div');
    sentinel.className = 'messages-sentinel';
    sentinel.style.height = '5px';
    sentinel.style.width = '100%';
    sentinel.style.position = 'relative';
    sentinel.style.top = '0';
    sentinel.id = 'messages-sentinel';
    
    // Insert at the beginning of the messages container
    const messagesContainer = scrollElement.querySelector('[data-messages-container]');
    if (messagesContainer) {
      messagesContainer.insertBefore(sentinel, messagesContainer.firstChild);
      sentinelRef.current = sentinel;
      return sentinel;
    }
    return null;
  };

  // Setup manual scroll handler for detecting top
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat || !hasMoreMessages) return;
    
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;
    
    const handleScroll = () => {
      // Check if we're at or very near the top
      if (scrollElement.scrollTop <= 10 && !isLoadingMore && hasMoreMessages) {
        loadOlderMessages();
      }
      
      // Also check bottom for updating new messages badge
      const isBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(isBottom);
      if (isBottom) setNewMessagesCount(0);
    };
    
    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [activeChat, messages, isLoadingMore, hasMoreMessages]);

  // Set up intersection observer as a backup for detecting scroll
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat || !hasMoreMessages) return;
    
    const sentinel = createSentinelElement();
    if (!sentinel) return;
    
    if (loadMoreObserverRef.current) {
      loadMoreObserverRef.current.disconnect();
    }
    
    loadMoreObserverRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isLoadingMore && hasMoreMessages) {
          loadOlderMessages();
        }
      },
      {
        root: getScrollElement(scrollAreaRef),
        rootMargin: '0px 0px 10px 0px',
        threshold: 0.1,
      }
    );
    
    loadMoreObserverRef.current.observe(sentinel);
    
    return () => {
      loadMoreObserverRef.current?.disconnect();
    };
  }, [messages, activeChat, isLoadingMore, hasMoreMessages]);

  // Function to load older messages
  const loadOlderMessages = async () => {
    if (!activeChat || isLoadingMore || !hasMoreMessages || !lastFetchedTimestamp) return;
    
    setIsLoadingMore(true);
    try {
      console.log("Loading older messages from timestamp:", lastFetchedTimestamp);
      const { olderMessages, oldestTimestamp } = await fetchOlderMessages(
        db, 
        activeChat, 
        lastFetchedTimestamp, 
        MESSAGES_PER_PAGE
      );

      console.log(`Fetched ${olderMessages.length} older messages`);
      if (olderMessages.length > 0) {
        // Save current scroll height to maintain position
        const scrollElement = getScrollElement(scrollAreaRef);
        const scrollHeight = scrollElement?.scrollHeight || 0;
        const scrollTop = scrollElement?.scrollTop || 0;
        
        // Merge old and new messages, ensuring they're correctly ordered
        setMessages(prevMessages => [...olderMessages, ...prevMessages]);
        messagesRef.current = [...olderMessages, ...messagesRef.current];
        
        // Update the oldest timestamp for next pagination
        setLastFetchedTimestamp(oldestTimestamp);
        
        // Set hasMoreMessages based on whether we got a full page of messages
        setHasMoreMessages(olderMessages.length >= MESSAGES_PER_PAGE);
        
        // Restore scroll position after messages are added
        setTimeout(() => {
          if (scrollElement) {
            const newScrollHeight = scrollElement.scrollHeight;
            const heightDifference = newScrollHeight - scrollHeight;
            scrollElement.scrollTop = scrollTop + heightDifference;
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
  }, [messages, activeChat, user?.uid]);

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
  }, [messages, activeChat, user?.uid, handleMarkMessageAsRead]);

  // Handle incoming messages without animation
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current || !initialPositionSet.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const previousLength = previousMessagesLength.current;
    const currentLength = messages.length;
    
    // Only process if we have new messages and not loading older messages
    if (currentLength > previousLength && !isLoadingMore) {
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
    } else if (!isLoadingMore) {
      // Update reference if not from loading more
      previousMessagesLength.current = currentLength;
    }
  }, [messages, user?.uid, isAtBottom, isLoadingMore]);

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