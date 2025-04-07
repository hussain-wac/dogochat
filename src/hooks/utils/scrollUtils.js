// Get scrollable element inside Radix ScrollArea
export const getScrollElement = (scrollAreaRef) => {
  return scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") || null;
};

// Check if user is at bottom
export const checkIsAtBottom = (scrollAreaRef) => {
  const el = getScrollElement(scrollAreaRef);
  if (el) {
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollTop + clientHeight >= scrollHeight - 10;
  }
  return true;
};

// Jump to bottom (manually triggered)
export const jumpToBottom = (scrollAreaRef, setIsAtBottom) => {
  const el = getScrollElement(scrollAreaRef);
  if (el) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
    if (setIsAtBottom) setIsAtBottom(true);
  }
};

// Scroll to first unread message
export const scrollToFirstUnread = (scrollAreaRef, messages, user) => {
  const el = getScrollElement(scrollAreaRef);
  if (!el || !messages.length) return;

  const firstUnread = messages.find(
    (m) => !m.readBy?.includes(user.uid) && m.sender !== user.uid
  );

  if (firstUnread) {
    const elTarget = el.querySelector(`[data-message-id="${firstUnread.id}"]`);
    if (elTarget) {
      const offset = el.clientHeight / 3;
      el.scrollTo({
        top: elTarget.offsetTop - offset,
        behavior: "smooth",
      });
    }
  }
};

// Only scroll if user is already at bottom
export const shouldScrollToBottomOnNewMessages = (
  scrollAreaRef,
  isAtBottom,
  prevLength,
  newLength
) => {
  return isAtBottom && newLength > prevLength;
};
