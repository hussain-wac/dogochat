import { useEffect, useRef } from "react";
import { fetchMessages, fetchOlderMessages } from "./utils/messageFetch";
import { getScrollElement } from "./utils/scrollUtils";

const MESSAGES_PER_PAGE = 20;

const useMessageLoader = ({
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
}) => {
  const messagesRef = useRef([]);

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
  }, [activeChat, db, setMessages, setLastFetchedTimestamp, setHasMoreMessages]);

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

  return {
    messagesRef,
    loadOlderMessages
  };
};

export default useMessageLoader;