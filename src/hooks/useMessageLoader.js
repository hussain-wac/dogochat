import { useEffect, useRef } from "react";
import { fetchMessages, fetchOlderMessages } from "./utils/messageFetch";
import { getScrollElement } from "./utils/scrollUtils";

const MESSAGES_PER_PAGE = 11;

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
  scrollAreaRef,
}) => {
  const messagesRef = useRef([]);
  const scrollPositionRef = useRef(null);

  useEffect(() => {
    if (!activeChat) return;

    setMessages([]);
    messagesRef.current = [];
    setLastFetchedTimestamp(null);
    setHasMoreMessages(true);

    const unsubscribe = fetchMessages(
      db,
      activeChat,
      MESSAGES_PER_PAGE,
      (newMessages) => {
        messagesRef.current = newMessages;
        setMessages(newMessages);

        const oldestTimestamp =
          newMessages.length > 0 ? newMessages[0].timestamp : null;

        setLastFetchedTimestamp(oldestTimestamp);
        setHasMoreMessages(newMessages.length >= MESSAGES_PER_PAGE);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeChat, db]);

  const loadOlderMessages = async () => {
    if (
      !activeChat ||
      isLoadingMore ||
      !hasMoreMessages ||
      !lastFetchedTimestamp
    )
      return;

    setIsLoadingMore(true);
    try {
      const scrollElement = getScrollElement(scrollAreaRef);
      if (scrollElement) {
        scrollPositionRef.current = {
          scrollHeight: scrollElement.scrollHeight,
          scrollTop: scrollElement.scrollTop,
        };
      }

      const { olderMessages, oldestTimestamp } = await fetchOlderMessages(
        db,
        activeChat,
        lastFetchedTimestamp,
        MESSAGES_PER_PAGE
      );

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
        messagesRef.current = [...olderMessages, ...messagesRef.current];
        setLastFetchedTimestamp(oldestTimestamp);
        setHasMoreMessages(olderMessages.length >= MESSAGES_PER_PAGE);

        requestAnimationFrame(() => {
          const scrollElement = getScrollElement(scrollAreaRef);
          if (scrollElement && scrollPositionRef.current) {
            const newScrollTop =
              scrollElement.scrollHeight -
              scrollPositionRef.current.scrollHeight +
              scrollPositionRef.current.scrollTop;

            scrollElement.scrollTop = newScrollTop;
          }
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setTimeout(() => setIsLoadingMore(false), 300);
    }
  };

  return {
    messagesRef,
    loadOlderMessages,
  };
};

export default useMessageLoader;
