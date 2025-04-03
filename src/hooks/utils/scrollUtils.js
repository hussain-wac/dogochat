import { atom } from "jotai";

// Store scroll positions for each chat
export const scrollPositionsAtom = atom({});

export const getScrollElement = (scrollAreaRef) => {
  return (
    scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") || null
  );
};

export const checkIsAtBottom = (scrollAreaRef) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    return scrollTop + clientHeight >= scrollHeight - 10;
  }
  return true;
};

// Set scroll position directly without animation
export const setScrollPosition = (scrollAreaRef, position) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    // Direct assignment without scrollTo to avoid any animation
    scrollElement.scrollTop = position;
  }
};

// Directly jump to bottom without animation
export const jumpToBottom = (scrollAreaRef, setNewMessagesCount, setIsAtBottom) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    // Direct assignment without scrollTo
    scrollElement.scrollTop = scrollElement.scrollHeight;
    setNewMessagesCount(0);
    setIsAtBottom(true);
  }
};

// Directly jump to specific message without animation
export const jumpToMessage = (scrollAreaRef, messageId, setIsAtBottom) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      // Calculate position to center the message
      const messageRect = messageElement.getBoundingClientRect();
      const containerRect = scrollElement.getBoundingClientRect();
      const centerOffset = (containerRect.height - messageRect.height) / 2;
      const targetScrollTop = scrollElement.scrollTop + 
                              messageElement.offsetTop - 
                              scrollElement.offsetTop - 
                              centerOffset;
      
      // Set position directly
      scrollElement.scrollTop = targetScrollTop;
      
      // Update state
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  }
};

// Save scroll position for a chat
export const saveScrollPosition = (scrollAreaRef, chatId, set) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement && chatId) {
    set((prev) => ({
      ...prev,
      [chatId]: scrollElement.scrollTop
    }));
  }
};

// Position the chat window without animation based on context
export const positionChat = (scrollAreaRef, chatId, messages, user, scrollPositions, setIsAtBottom, setNewMessagesCount) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (!scrollElement || !messages.length) return;

  // Check if we have a saved position for this chat
  const savedPosition = scrollPositions[chatId];
  
  if (savedPosition !== undefined) {
    // Direct assignment without animation
    scrollElement.scrollTop = savedPosition;
    
    // Check if we're at bottom after positioning
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    return;
  }

  // Find first unread message
  const firstUnreadIndex = messages.findIndex(
    (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
  );

  if (firstUnreadIndex > -1) {
    // Get message element
    const messageId = messages[firstUnreadIndex].id;
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);
    
    if (messageElement) {
      // Calculate position to place message in view
      const containerHeight = scrollElement.clientHeight;
      const targetPosition = messageElement.offsetTop - (containerHeight / 3);
      
      // Set position directly
      scrollElement.scrollTop = targetPosition;
    }
  } else {
    // If no unread messages, position at bottom
    scrollElement.scrollTop = scrollElement.scrollHeight;
    setIsAtBottom(true);
    setNewMessagesCount(0);
  }
};