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