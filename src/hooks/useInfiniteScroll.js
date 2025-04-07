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
  const mutationObserverRef = useRef(null);

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

    const attemptRestore = () => {
      const newScrollHeight = scrollElement.scrollHeight;
      const delta = newScrollHeight - scrollRestoreRef.current.scrollHeight;
      scrollElement.scrollTop = scrollRestoreRef.current.scrollTop + delta;

      // Check if scroll was restored correctly
      if (
        Math.abs(
          scrollElement.scrollTop - (scrollRestoreRef.current.scrollTop + delta)
        ) > 1
      ) {
        requestAnimationFrame(attemptRestore);
      }
    };

    requestAnimationFrame(attemptRestore);
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

  useEffect(() => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;

    let timeout = null;

    const onScroll = () => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        if (
          scrollElement.scrollTop <= SCROLL_THRESHOLD &&
          hasMoreMessages &&
          !isLoadingMore
        ) {
          saveScrollPosition();
          loadOlderMessages();
        }
      }, 100);
    };

    scrollElement.addEventListener("scroll", onScroll);
    return () => {
      scrollElement.removeEventListener("scroll", onScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [scrollAreaRef, isLoadingMore, hasMoreMessages, loadOlderMessages]);

  useEffect(() => {
    const prevLen = prevMessagesLengthRef.current;
    const currLen = messages.length;

    if (currLen > prevLen && !isLoadingMore) {
      const scrollElement = getScrollElement(scrollAreaRef);
      if (!scrollElement) return;

      const container = scrollElement.querySelector(
        "[data-messages-container]"
      );
      if (!container) return;

      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }

      mutationObserverRef.current = new MutationObserver(() => {
        restoreScrollPosition();
        mutationObserverRef.current.disconnect();
      });

      mutationObserverRef.current.observe(container, {
        childList: true,
        subtree: true,
      });
    }

    prevMessagesLengthRef.current = currLen;
  }, [messages, isLoadingMore]);

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
        threshold: 2.0,
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

  return { sentinelRef, isFetchingOlderMessages: isLoadingMore };
};

export default useInfiniteScroll;
