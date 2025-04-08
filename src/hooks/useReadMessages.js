// useReadMessages.js
import { useRef, useEffect, useCallback } from "react";
import { markMessageAsRead } from "./utils/chatOperations";

const useReadMessages = ({
  db,
  scrollAreaRef,
  activeChat,
  messages,
  userId,
  handleMarkMessageAsRead,
}) => {
  const observerRef = useRef(null);
  const markedMessages = useRef(new Set());

  const markAsRead = useCallback(
    async (messageId) => {
      if (!messageId || markedMessages.current.has(messageId)) return;

      const success = await markMessageAsRead(
        db,
        activeChat,
        messageId,
        userId
      );
      if (success) {
        markedMessages.current.add(messageId);
        handleMarkMessageAsRead?.(messageId);
      }
    },
    [db, activeChat, userId, handleMarkMessageAsRead]
  );

  // Initial marking of unread messages
  useEffect(() => {
    if (!db || !activeChat || !messages?.length || !userId) {
      return;
    }

    const markUnreadMessages = async () => {
      const unreadMessages = messages.filter(
        (msg) =>
          msg.id && !msg.readBy?.includes(userId) && msg.sender !== userId
      );

      for (const msg of unreadMessages) {
        try {
          await markAsRead(msg.id);
        } catch (error) {
          console.error(`Failed to mark message ${msg.id}:`, error);
        }
      }
    };

    markUnreadMessages();
  }, [db, activeChat, messages, userId, markAsRead]);

  // Intersection Observer for real-time marking
  useEffect(() => {
    if (
      !db ||
      !scrollAreaRef.current ||
      !messages?.length ||
      !activeChat ||
      !userId
    ) {
      return;
    }

    const scrollElement = scrollAreaRef.current;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            const message = messages.find((m) => m.id === messageId);

            if (
              message &&
              !message.readBy?.includes(userId) &&
              message.sender !== userId
            ) {
              markAsRead(messageId);
            }
          }
        });
      },
      {
        root: scrollElement,
        threshold: 0.7,
      }
    );

    const messageElements = scrollElement.querySelectorAll("[data-message-id]");

    messageElements.forEach((element) => {
      observerRef.current.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [db, activeChat, messages, userId, markAsRead]);

  // Reset on chat change
  useEffect(() => {
    markedMessages.current.clear();
  }, [activeChat]);

  return {
    markedMessages: markedMessages.current,
    markAsRead,
  };
};

export default useReadMessages;
