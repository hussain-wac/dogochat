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
  const scrollPositionRef = useRef(null);

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
      // Save scroll state before fetching
      const scrollElement = getScrollElement(scrollAreaRef);
      if (scrollElement) {
        scrollPositionRef.current = {
          scrollHeight: scrollElement.scrollHeight,
          scrollTop: scrollElement.scrollTop
        };
      }
      
      const { olderMessages, oldestTimestamp } = await fetchOlderMessages(
        db, activeChat, lastFetchedTimestamp, MESSAGES_PER_PAGE
      );

      if (olderMessages.length > 0) {
        // Update messages with a slight delay to ensure smooth rendering
        setTimeout(() => {
          setMessages(prev => [...olderMessages, ...prev]);
          messagesRef.current = [...olderMessages, ...messagesRef.current];
          setLastFetchedTimestamp(oldestTimestamp);
          setHasMoreMessages(olderMessages.length >= MESSAGES_PER_PAGE);
          
          // Restore scroll position with a slight delay
          requestAnimationFrame(() => {
            const scrollElement = getScrollElement(scrollAreaRef);
            if (scrollElement && scrollPositionRef.current) {
              const newScrollTop = scrollElement.scrollHeight - 
                scrollPositionRef.current.scrollHeight + 
                scrollPositionRef.current.scrollTop;
              
              scrollElement.scrollTop = newScrollTop;
            }
          });
        }, 10);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setTimeout(() => setIsLoadingMore(false), 300); // Add slight delay for smoother UX
    }
  };

  return {
    messagesRef,
    loadOlderMessages
  };
};

export default useMessageLoader;