import { useRef, useEffect } from "react";
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
  isAtBottom, // Added isAtBottom parameter
}) => {
  const initialPositionSet = useRef(false);
  const previousMessagesLength = useRef(0);

  // Effect: Setup scroll handler for bottom detection
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
  }, [activeChat, scrollAreaRef, setIsAtBottom, setNewMessagesCount]);

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
  }, [messages, activeChat, user, scrollPositions, setIsAtBottom, setNewMessagesCount]);

  // Effect: Handle new messages and autoscroll
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
  }, [messages, user?.uid, isAtBottom, isLoadingMore, setNewMessagesCount, setIsAtBottom]);

  // Effect: Reset refs on chat change
  useEffect(() => {
    initialPositionSet.current = false;
  }, [activeChat]);

  return {
    initialPositionSet,
    previousMessagesLength,
    scrollToBottom: () => jumpToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom)
  };
};

export default useMessageScroll;