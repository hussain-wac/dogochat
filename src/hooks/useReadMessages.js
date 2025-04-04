import { useRef, useEffect } from "react";
import { getScrollElement } from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import { markMessageAsRead } from "./utils/chatOperations";

const useReadMessages = ({
  scrollAreaRef,
  activeChat,
  messages,
  userId,
  handleMarkMessageAsRead,
  setNewMessagesCount,
}) => {
  const observerRef = useRef(null);
  const hasMarkedRead = useRef(false);

  // Effect: Mark unread messages as read on initial load
  useEffect(() => {
    if (!activeChat || !messages.length || hasMarkedRead.current) return;
    
    const unreadMessages = messages.filter(
      msg => !msg.readBy?.includes(userId) && msg.sender !== userId
    );
    
    if (unreadMessages.length > 0) {
      Promise.all(
        unreadMessages.map(msg => markMessageAsRead(activeChat, msg.id, userId))
      ).then(() => {
        hasMarkedRead.current = true;
        setNewMessagesCount(0);
      });
    } else {
      hasMarkedRead.current = true;
      setNewMessagesCount(0);
    }
  }, [messages, activeChat, userId, setNewMessagesCount]);

  // Effect: Reset refs on chat change
  useEffect(() => {
    hasMarkedRead.current = false;
  }, [activeChat]);

  // Effect: Setup message intersection observer for read tracking
  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = observeMessages(
      messages,
      userId,
      handleMarkMessageAsRead,
      scrollAreaRef
    );
    
    getScrollElement(scrollAreaRef)
      ?.querySelectorAll("[data-message-id]")
      .forEach(element => observerRef.current.observe(element));
      
    return () => observerRef.current?.disconnect();
  }, [messages, activeChat, userId, handleMarkMessageAsRead]);

  return {
    hasMarkedRead,
  };
};

export default useReadMessages;