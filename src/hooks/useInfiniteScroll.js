import { useRef, useEffect, useCallback } from "react";
import { getScrollElement } from "./utils/scrollUtils";

const SCROLL_THRESHOLD = 100;

const useInfiniteScroll = ({
  scrollAreaRef,
  activeChat,
  isLoadingMore,
  hasMoreMessages,
  loadOlderMessages,
  messages,
}) => {
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const scrollRestoreRef = useRef({ scrollTop: 0, scrollHeight: 0 });
  const prevMessagesLengthRef = useRef(messages.length);

  const saveScrollPosition = () => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (scrollElement) {
      scrollRestoreRef.current.scrollTop = scrollElement.scrollTop;
      scrollRestoreRef.current.scrollHeight = scrollElement.scrollHeight;
    }
  };

  const restoreScrollPosition = () => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;

    requestAnimationFrame(() => {
      const newScrollHeight = scrollElement.scrollHeight;
      const delta = newScrollHeight - scrollRestoreRef.current.scrollHeight;

      scrollElement.scrollTop = scrollRestoreRef.current.scrollTop + delta;
    });
  };

  const createSentinel = useCallback(() => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return null;

    const container = scrollElement.querySelector("[data-messages-container]");
    if (!container) return null;

    let sentinel = container.querySelector("#messages-sentinel");
    if (!sentinel) {
      sentinel = document.createElement("div");
      sentinel.id = "messages-sentinel";
      sentinel.style.cssText = "height: 1px; width: 100%; opacity: 0;";
      container.insertBefore(sentinel, container.firstChild);
    }

    sentinelRef.current = sentinel;
    return sentinel;
  }, [scrollAreaRef]);

  // Scroll listener (manual top check)
  useEffect(() => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;

    const onScroll = () => {
      if (
        scrollElement.scrollTop <= SCROLL_THRESHOLD &&
        hasMoreMessages &&
        !isLoadingMore
      ) {
        saveScrollPosition();
        loadOlderMessages();
      }
    };

    scrollElement.addEventListener("scroll", onScroll);
    return () => scrollElement.removeEventListener("scroll", onScroll);
  }, [scrollAreaRef, isLoadingMore, hasMoreMessages, loadOlderMessages]);

  // Restore scroll after messages load
  useEffect(() => {
    const prevLen = prevMessagesLengthRef.current;
    const currLen = messages.length;

    if (currLen > prevLen && !isLoadingMore) {
      restoreScrollPosition();
    }

    prevMessagesLengthRef.current = currLen;
  }, [messages, isLoadingMore]);

  // Intersection observer (optional, for redundancy)
  useEffect(() => {
    if (!scrollAreaRef.current || !hasMoreMessages || !activeChat) return;

    const scrollElement = getScrollElement(scrollAreaRef);
    const sentinel = createSentinel();
    if (!scrollElement || !sentinel) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore && hasMoreMessages) {
          saveScrollPosition();
          loadOlderMessages();
        }
      },
      {
        root: scrollElement,
        threshold: 1.0,
        rootMargin: "0px",
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [
    messages,
    activeChat,
    isLoadingMore,
    hasMoreMessages,
    loadOlderMessages,
    createSentinel,
  ]);

  return { sentinelRef };
};

export default useInfiniteScroll;
