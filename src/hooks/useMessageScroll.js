import { useRef, useCallback } from "react";
import {
  jumpToBottom,
  checkIsAtBottom,
} from "./utils/scrollUtils";

const useMessageScroll = ({ scrollAreaRef }) => {
  const isAutoScrollingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    isAutoScrollingRef.current = true;
    requestAnimationFrame(() => {
      jumpToBottom(scrollAreaRef);
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    });
  }, [scrollAreaRef]);

  const isAtBottom = useCallback(() => {
    return checkIsAtBottom(scrollAreaRef);
  }, [scrollAreaRef]);

  return {
    scrollToBottom,
    isAtBottom,
    isAutoScrollingRef,
  };
};
export default useMessageScroll;
