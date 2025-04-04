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
        behavior: 'smooth',
      });
    } else {
      scrollElement.scrollTop = position;
    }
  }
};

// Smoothly scroll to bottom
export const jumpToBottom = (scrollAreaRef, setNewMessagesCount, setIsAtBottom) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (scrollElement) {
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior: 'smooth',
    });
    setNewMessagesCount?.(0);
    setIsAtBottom?.(true);
  }
};

// Smoothly scroll to a specific message
export const jumpToMessage = (scrollAreaRef, messageId, setIsAtBottom) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (!scrollElement) return;

  const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);
  if (messageElement) {
    const containerRect = scrollElement.getBoundingClientRect();
    const centerOffset = (containerRect.height - messageElement.offsetHeight) / 2;
    const targetScrollTop =
      scrollElement.scrollTop +
      messageElement.offsetTop -
      scrollElement.offsetTop -
      centerOffset;

    scrollElement.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    setIsAtBottom?.(scrollTop + clientHeight >= scrollHeight - 10);
  }
};

// Scroll to first unread or bottom if none
export const positionChat = (
  scrollAreaRef,
  chatId,
  messages,
  user,
  setIsAtBottom,
  setNewMessagesCount
) => {
  const scrollElement = getScrollElement(scrollAreaRef);
  if (!scrollElement || !messages.length) return;

  const firstUnreadIndex = messages.findIndex(
    (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
  );

  if (firstUnreadIndex > -1) {
    const messageId = messages[firstUnreadIndex].id;
    const messageElement = scrollElement.querySelector(`[data-message-id="${messageId}"]`);

    if (messageElement) {
      const containerHeight = scrollElement.clientHeight;
      const targetPosition = messageElement.offsetTop - containerHeight / 3;

      scrollElement.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      return;
    }
  }

  // No unread message found — scroll to bottom
  scrollElement.scrollTo({
    top: scrollElement.scrollHeight,
    behavior: 'smooth',
  });

  setIsAtBottom?.(true);
  setNewMessagesCount?.(0);
};
