export const getScrollElement = (scrollAreaRef) => {
  return scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") || null;
};

export const checkIsAtBottom = (scrollAreaRef, threshold = 10) => {
  const el = getScrollElement(scrollAreaRef);
  if (el) {
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceFromBottom <= threshold;
  }
  return true;
};
export const jumpToBottom = (scrollAreaRef) => {
  const el = getScrollElement(scrollAreaRef);
  if (el) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }
};
