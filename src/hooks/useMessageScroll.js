import { useRef, useEffect, useCallback } from "react";
import {
  getScrollElement,
  checkIsAtBottom,
  jumpToBottom,
  positionChat,
} from "./utils/scrollUtils";

const useMessageScroll = ({
  scrollAreaRef,
  activeChat,
  messages,
  user,
  setIsAtBottom,
  setNewMessagesCount,
  isLoadingMore,
  isAtBottom,
}) => {
  const initialPositionSet = useRef(false);
  const previousMessagesLength = useRef(0);
  const isAutoScrollingRef = useRef(false);

  // Detect if user scrolls to bottom or away
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat) return;

    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;

      const isBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(isBottom);
      if (isBottom) setNewMessagesCount(0);
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [activeChat, scrollAreaRef, setIsAtBottom, setNewMessagesCount]);

  // Initial scroll position
  useEffect(() => {
    if (!activeChat || !messages.length || !scrollAreaRef.current || initialPositionSet.current) return;

    requestAnimationFrame(() => {
      isAutoScrollingRef.current = true;
      positionChat(
        scrollAreaRef,
        activeChat,
        messages,
        user,
        setIsAtBottom,
        setNewMessagesCount
      );
      initialPositionSet.current = true;

      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [messages, activeChat, user, setIsAtBottom, setNewMessagesCount]);

  // Track message count but don't scroll
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current || !initialPositionSet.current) return;

    const previousLength = previousMessagesLength.current;
    const currentLength = messages.length;

    if (currentLength > previousLength && !isLoadingMore) {
      const newCount = currentLength - previousLength;
      previousMessagesLength.current = currentLength;

      if (!isAtBottom) {
        setNewMessagesCount(prev => prev + newCount);
      }
    } else if (!isLoadingMore) {
      previousMessagesLength.current = currentLength;
    }
  }, [messages, isAtBottom, isLoadingMore, setNewMessagesCount]);

  // Reset state on chat switch
  useEffect(() => {
    initialPositionSet.current = false;
    previousMessagesLength.current = 0;
  }, [activeChat]);

  // Expose manual scroll to bottom
  const scrollToBottom = useCallback(() => {
    isAutoScrollingRef.current = true;

    requestAnimationFrame(() => {
      jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom);
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [scrollAreaRef, setNewMessagesCount, setIsAtBottom]);

  return {
    scrollToBottom,
    isAutoScrollingRef,
  };
};

export default useMessageScroll;
