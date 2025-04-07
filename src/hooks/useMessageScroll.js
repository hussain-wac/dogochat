import { useRef, useEffect, useCallback } from "react";
import {
  getScrollElement,
  checkIsAtBottom,
  jumpToBottom,
  scrollToFirstUnread,
  shouldScrollToBottomOnNewMessages,
} from "./utils/scrollUtils";

const useMessageScroll = ({
  scrollAreaRef,
  activeChat,
  messages,
  user,
  setIsAtBottom,
  isAtBottom,
}) => {
  const initialPositionSet = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const prevMessagesLengthRef = useRef(0);

  // Handle user scroll events
  useEffect(() => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement || !activeChat) return;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      const atBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(atBottom);
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [activeChat, scrollAreaRef, setIsAtBottom]);

  // Initial scroll to first unread
  useEffect(() => {
    if (
      !activeChat ||
      !messages.length ||
      !scrollAreaRef.current ||
      initialPositionSet.current
    )
      return;

    requestAnimationFrame(() => {
      isAutoScrollingRef.current = true;
      scrollToFirstUnread(scrollAreaRef, messages, user);
      initialPositionSet.current = true;

      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [messages, activeChat, user]);

  // Only scroll to bottom if user is already at bottom
  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length) return;

    const prevLength = prevMessagesLengthRef.current;
    const newLength = messages.length;

    if (
      shouldScrollToBottomOnNewMessages(
        scrollAreaRef,
        isAtBottom,
        prevLength,
        newLength
      )
    ) {
      scrollToBottom();
    }

    prevMessagesLengthRef.current = newLength;
  }, [messages, isAtBottom]);

  // Reset scroll flags on chat switch
  useEffect(() => {
    initialPositionSet.current = false;
    prevMessagesLengthRef.current = 0;
  }, [activeChat]);

  // Manual scroll-to-bottom
  const scrollToBottom = useCallback(() => {
    isAutoScrollingRef.current = true;

    requestAnimationFrame(() => {
      jumpToBottom(scrollAreaRef, setIsAtBottom);
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [scrollAreaRef, setIsAtBottom]);

  return {
    scrollToBottom,
    isAutoScrollingRef,
  };
};

export default useMessageScroll;
