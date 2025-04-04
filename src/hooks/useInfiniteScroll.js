import { useRef, useEffect, useCallback } from "react";
import { getScrollElement } from "./utils/scrollUtils";

const SCROLL_THRESHOLD = 150; // px from top to trigger load
const DEBOUNCE_DELAY = 100; // ms to debounce scroll events

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
  const scrollTimerRef = useRef(null);

  // Create sentinel element for infinite scroll
  const createSentinelElement = useCallback(() => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return null;
    
    // Find or create messages container
    let messagesContainer = scrollElement.querySelector('[data-messages-container]');
    if (!messagesContainer) return null;
    
    // Check for existing sentinel
    let sentinel = messagesContainer.querySelector('#messages-sentinel');
    
    // Create if doesn't exist
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.id = 'messages-sentinel';
      sentinel.className = 'messages-sentinel';
      sentinel.style.cssText = 'height:10px;width:100%;position:relative;top:0;opacity:0;';
      
      // Insert at the beginning
      messagesContainer.insertBefore(sentinel, messagesContainer.firstChild);
    }
    
    sentinelRef.current = sentinel;
    return sentinel;
  }, [scrollAreaRef]);

  // Debounced scroll handler for loading more messages
  const handleScroll = useCallback(() => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    scrollTimerRef.current = setTimeout(() => {
      const scrollElement = getScrollElement(scrollAreaRef);
      if (!scrollElement || isLoadingMore || !hasMoreMessages) return;
      
      // Check if we're near the top of the scroll area
      if (scrollElement.scrollTop <= SCROLL_THRESHOLD) {
        loadOlderMessages();
      }
    }, DEBOUNCE_DELAY);
  }, [scrollAreaRef, isLoadingMore, hasMoreMessages, loadOlderMessages]);

  // Setup scroll handler
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat || !hasMoreMessages) return;
    
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;
    
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [activeChat, messages, isLoadingMore, hasMoreMessages, loadOlderMessages, handleScroll]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!scrollAreaRef.current || !activeChat || !hasMoreMessages) return;
    
    const sentinel = createSentinelElement();
    if (!sentinel) return;
    
    // Cleanup existing observer
    if (loadMoreObserverRef.current) {
      loadMoreObserverRef.current.disconnect();
    }
    
    // Create new observer
    loadMoreObserverRef.current = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting && !isLoadingMore && hasMoreMessages) {
          loadOlderMessages();
        }
      },
      {
        root: getScrollElement(scrollAreaRef),
        rootMargin: '100px 0px 0px 0px', // Increased margin for earlier triggering
        threshold: 0.1,
      }
    );
    
    loadMoreObserverRef.current.observe(sentinel);
    
    return () => {
      if (loadMoreObserverRef.current) {
        loadMoreObserverRef.current.disconnect();
      }
    };
  }, [
    messages, 
    activeChat, 
    isLoadingMore, 
    hasMoreMessages, 
    loadOlderMessages, 
    createSentinelElement
  ]);

  return {
    sentinelRef,
  };
};

export default useInfiniteScroll;