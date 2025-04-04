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

// Set scroll position (optionally smooth)
export const setScrollPosition = (scrollAreaRef, position, smooth = false) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    if (smooth) {
      scrollElement.scrollTo({
        top: position,
        behavior: 'smooth'
      });
    } else {
      scrollElement.scrollTop = position;
    }
  }
};

// Smoothly jump to bottom
export const jumpToBottom = (scrollAreaRef, setNewMessagesCount, setIsAtBottom) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior: 'smooth'
    });
    if (setNewMessagesCount) setNewMessagesCount(0);
    if (setIsAtBottom) setIsAtBottom(true);
  }
};

// Smoothly jump to a specific message
export const jumpToMessage = (scrollAreaRef, messageId, setIsAtBottom) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      const messageRect = messageElement.getBoundingClientRect();
      const containerRect = scrollElement.getBoundingClientRect();
      const centerOffset = (containerRect.height - messageRect.height) / 2;
      const targetScrollTop = scrollElement.scrollTop +
                              messageElement.offsetTop -
                              scrollElement.offsetTop -
                              centerOffset;

      scrollElement.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      });

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      if (setIsAtBottom) setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    }
  }
};

// Save scroll position
export const saveScrollPosition = (scrollAreaRef, chatId, set) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement && chatId) {
    set((prev) => ({
      ...prev,
      [chatId]: scrollElement.scrollTop
    }));
  }
};

// Position chat (with smooth scroll if no saved position)
export const positionChat = (scrollAreaRef, chatId, messages, user, scrollPositions, setIsAtBottom, setNewMessagesCount) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (!scrollElement || !messages.length) return;

  const savedPosition = scrollPositions[chatId];
  
  if (savedPosition !== undefined) {
    scrollElement.scrollTop = savedPosition;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    if (setIsAtBottom) setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    return;
  }

  const firstUnreadIndex = messages.findIndex(
    (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
  );

  if (firstUnreadIndex > -1) {
    const messageId = messages[firstUnreadIndex].id;
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);

    if (messageElement) {
      const containerHeight = scrollElement.clientHeight;
      const targetPosition = messageElement.offsetTop - (containerHeight / 3);

      scrollElement.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  } else {
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior: 'smooth'
    });

    if (setIsAtBottom) setIsAtBottom(true);
    if (setNewMessagesCount) setNewMessagesCount(0);
  }
};
