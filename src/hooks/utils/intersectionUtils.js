export function observeMessages(messages, userId, markMessageAsRead, scrollAreaRef) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const messageId = entry.target.dataset.messageId;
          const message = messages.find((msg) => msg.id === messageId);

          if (
            message &&
            message.sender !== userId &&
            (!message.readBy || !message.readBy.includes(userId))
          ) {
            markMessageAsRead(messageId);
          }
        }
      });
    },
    {
      root: scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]"),
      threshold: 0.5,
    }
  );

  return observer;
}