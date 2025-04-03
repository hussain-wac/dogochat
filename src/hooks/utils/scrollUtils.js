import { atom } from "jotai";
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

export const scrollToBottom = (scrollAreaRef, setNewMessagesCount, setIsAtBottom, behavior = "smooth") => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior,
    });
    setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setNewMessagesCount(0);
        setIsAtBottom(true);
      }
    }, 300);
  }
};
export const scrollToMessage = (scrollAreaRef, messageId, setIsAtBottom, behavior = "smooth") => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior, 
        block: 'center' 
      });
      setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
      }, 300);
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

// Restore scroll position or smart scroll to unread/latest
export const smartScroll = (scrollAreaRef, chatId, messages, user, scrollPositions, setIsAtBottom, setNewMessagesCount) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (!scrollElement || !messages.length) return;

  // Check if we have a saved position for this chat
  const savedPosition = scrollPositions[chatId];
  
  if (savedPosition !== undefined) {
    // If we have a saved position, restore it
    scrollElement.scrollTop = savedPosition;
    
    // Check if we're at bottom after restoring
    setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }, 100);
    return;
  }

  // Find first unread message
  const firstUnreadIndex = messages.findIndex(
    (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
  );

  if (firstUnreadIndex > -1) {
    // Scroll to first unread message
    const messageId = messages[firstUnreadIndex].id;
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);
    
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "auto",
        block: 'center'
      });
    }
  } else {
    // If no unread messages, scroll to bottom
    scrollElement.scrollTop = scrollElement.scrollHeight;
    setIsAtBottom(true);
    setNewMessagesCount(0);
  }
};