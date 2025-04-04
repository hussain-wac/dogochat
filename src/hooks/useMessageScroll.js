import { useRef, useEffect, useCallback } from "react";
import { 
  getScrollElement, 
  checkIsAtBottom, 
  jumpToBottom,
  positionChat
} from "./utils/scrollUtils";

const useMessageScroll = ({
  scrollAreaRef,
  activeChat,
  messages,
  user,
  scrollPositions,
  setIsAtBottom,
  setNewMessagesCount,
  isLoadingMore,
  isAtBottom,
}) => {
  const initialPositionSet = useRef(false);
  const previousMessagesLength = useRef(0);
  const isAutoScrollingRef = useRef(false);

  // Effect: Setup scroll handler for bottom detection
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat) return;
    
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;
    
    const handleScroll = () => {
      // Skip checks during programmatic scrolling
      if (isAutoScrollingRef.current) return;
      
      // Check if we're at the bottom
      const isBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(isBottom);
      if (isBottom) setNewMessagesCount(0);
    };
    
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [activeChat, scrollAreaRef, setIsAtBottom, setNewMessagesCount]);

  // Effect: Initial positioning
  useEffect(() => {
    if (!activeChat || !messages.length || !scrollAreaRef.current || initialPositionSet.current) return;
    
    // Use requestAnimationFrame for smoother positioning
    requestAnimationFrame(() => {
      isAutoScrollingRef.current = true;
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
      
      // Reset flag after scrolling is complete
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [messages, activeChat, user, scrollPositions, setIsAtBottom, setNewMessagesCount]);

  // Effect: Handle new messages and autoscroll
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current || !initialPositionSet.current) return;
    
    const lastMessage = messages[messages.length - 1];
    const previousLength = previousMessagesLength.current;
    const currentLength = messages.length;
    
    if (currentLength > previousLength && !isLoadingMore) {
      const isLastMessageFromUser = lastMessage?.sender === user?.uid;
      const newCount = currentLength - previousLength;
      
      previousMessagesLength.current = currentLength;
      
      if ((isAtBottom && !isLoadingMore) || isLastMessageFromUser) {
        isAutoScrollingRef.current = true;
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom);
          
          // Reset flag after scrolling is complete
          setTimeout(() => {
            isAutoScrollingRef.current = false;
          }, 100);
        });
      } else if (!isLoadingMore) {
        setNewMessagesCount(prev => prev + newCount);
      }
    } else if (!isLoadingMore) {
      previousMessagesLength.current = currentLength;
    }
  }, [messages, user?.uid, isAtBottom, isLoadingMore, setNewMessagesCount, setIsAtBottom]);

  // Effect: Reset refs on chat change
  useEffect(() => {
    initialPositionSet.current = false;
    previousMessagesLength.current = 0;
  }, [activeChat]);

  // Smooth scroll to bottom implementation
  const scrollToBottom = useCallback(() => {
    isAutoScrollingRef.current = true;
    
    requestAnimationFrame(() => {
      jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom);
      
      // Reset flag after scrolling is complete
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [scrollAreaRef, setNewMessagesCount, setIsAtBottom]);

  return {
    initialPositionSet,
    previousMessagesLength,
    scrollToBottom
  };
};

export default useMessageScroll;