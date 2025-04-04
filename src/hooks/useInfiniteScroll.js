import { useRef, useEffect } from "react";
import { getScrollElement } from "./utils/scrollUtils";

const useInfiniteScroll = ({
  scrollAreaRef,
  activeChat,
  isLoadingMore,
  hasMoreMessages,
  loadOlderMessages,
  messages,
}) => {
  const loadMoreObserverRef = useRef(null);
  const sentinelRef = useRef(null);

  // Create sentinel element for infinite scroll
  const createSentinelElement = () => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return null;
    
    const existingSentinel = scrollElement.querySelector('.messages-sentinel');
    if (existingSentinel) existingSentinel.remove();
    
    const sentinel = document.createElement('div');
    sentinel.className = 'messages-sentinel';
    sentinel.style.cssText = 'height:5px;width:100%;position:relative;top:0;';
    sentinel.id = 'messages-sentinel';
    
    const messagesContainer = scrollElement.querySelector('[data-messages-container]');
    if (messagesContainer) {
      messagesContainer.insertBefore(sentinel, messagesContainer.firstChild);
      sentinelRef.current = sentinel;
      return sentinel;
    }
    return null;
  };

  // Setup scroll handler for loading more messages
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat || !hasMoreMessages) return;
    
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;
    
    const handleScroll = () => {
      // Check top for loading more
      if (scrollElement.scrollTop <= 10 && !isLoadingMore && hasMoreMessages) {
        loadOlderMessages();
      }
    };
    
    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [activeChat, messages, isLoadingMore, hasMoreMessages, loadOlderMessages]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat || !hasMoreMessages) return;
    
    const sentinel = createSentinelElement();
    if (!sentinel) return;
    
    if (loadMoreObserverRef.current) loadMoreObserverRef.current.disconnect();
    
    loadMoreObserverRef.current = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isLoadingMore && hasMoreMessages) {
          loadOlderMessages();
        }
      },
      {
        root: getScrollElement(scrollAreaRef),
        rootMargin: '0px 0px 10px 0px',
        threshold: 0.1,
      }
    );
    
    loadMoreObserverRef.current.observe(sentinel);
    return () => loadMoreObserverRef.current?.disconnect();
  }, [messages, activeChat, isLoadingMore, hasMoreMessages, loadOlderMessages]);

  return {
    sentinelRef,
  };
};

export default useInfiniteScroll;