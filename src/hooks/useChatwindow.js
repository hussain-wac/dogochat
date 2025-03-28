import { useState, useRef, useEffect, useMemo } from "react";
import { chatdetails, globalState } from "../jotai/globalState";
import { useAtomValue } from "jotai";
import useSWR from "swr";
import { useParams } from "react-router-dom";
import { fetchMessages } from "./utils/messageFetch";
import { formatMessageTime } from "./utils/timeFormat";
import { sendMessage, markMessageAsRead, fetchChatId } from "./utils/chatOperations";
import { getScrollElement, checkIsAtBottom, scrollToBottom } from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import { ref, onValue } from "firebase/database";
import { db, realtimeDb } from "../firebase";

const useChatWindow = () => {
  const { username } = useParams();
  const user = useAtomValue(globalState);
  const chatdet = useAtomValue(chatdetails);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollAreaRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const lastMessageCountRef = useRef(0);
  const observerRef = useRef(null);
  const [isOpponentOnline, setIsOpponentOnline] = useState(false);
  const [lastOnline, setLastOnline] = useState(null);
  const hasMarkedRead = useRef(false);

  const { data, error, isLoading } = useSWR(
    activeChat ? ["messages", activeChat] : null,
    () => fetchMessages(db, activeChat, setMessages),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    fetchChatId(db, user, username, setActiveChat);
  }, [username, user]);

  useEffect(() => {
    if (!username || !user) return;

    const lowercaseUsername = username.toLowerCase();
    const presenceRef = ref(realtimeDb, `presence/${lowercaseUsername}`);

    const handlePresenceChange = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setIsOpponentOnline(data?.online || false);
        setLastOnline(data?.lastOnline || null);
      } else {
        setIsOpponentOnline(false);
        setLastOnline(null);
      }
    };

    const unsubscribe = onValue(presenceRef, handlePresenceChange, (error) => {
      console.error("Presence listener error:", error);
    });

    return () => unsubscribe();
  }, [username, user]);

  // Mark all unread messages as read when chat opens
  useEffect(() => {
    if (!activeChat || !messages.length || !user.uid || hasMarkedRead.current) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
    );
    if (unreadMessages.length > 0) {
      Promise.all(
        unreadMessages.map((msg) => markMessageAsRead(db, activeChat, msg.id, user.uid))
      ).then(() => {
        hasMarkedRead.current = true; // Mark as read only after all updates complete
      });
    } else {
      hasMarkedRead.current = true; // No unread messages, mark as done
    }
  }, [activeChat, messages, user.uid]);

  useEffect(() => {
    hasMarkedRead.current = false; // Reset when chat changes
  }, [activeChat]);

  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((msg) => {
      const date = msg.timestamp.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  const handleSendMessage = () => {
    sendMessage(db, activeChat, newMessage, user.uid, (behavior) =>
      scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, behavior)
    );
    setNewMessage("");
  };

  const handleMarkMessageAsRead = (messageId) => {
    markMessageAsRead(db, activeChat, messageId, user.uid);
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = observeMessages(messages, user.uid, handleMarkMessageAsRead, scrollAreaRef);

    const scrollElement = getScrollElement(scrollAreaRef);
    if (scrollElement) {
      const messageElements = scrollElement.querySelectorAll("[data-message-id]");
      messageElements.forEach((element) => {
        observerRef.current.observe(element);
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, activeChat, user.uid]);

  useEffect(() => {
    const scrollElement = getScrollElement(scrollAreaRef);
    if (scrollElement) {
      const handleScroll = () => {
        const isBottom = checkIsAtBottom(scrollAreaRef);
        setIsAtBottom(isBottom);
        if (isBottom) setNewMessagesCount(0);
      };
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [activeChat, isLoading]);

  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;

    const scrollElement = getScrollElement(scrollAreaRef);
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage.sender === user.uid;

    if (!isLastMessageFromUser) {
      const isNearBottom =
        scrollElement &&
        scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight < 100;

      if (!isNearBottom && messages.length !== lastMessageCountRef.current) {
        setNewMessagesCount((prev) => prev + 1);
      }
    }

    lastMessageCountRef.current = messages.length;

    if (isLastMessageFromUser) {
      setTimeout(() => scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, "smooth"), 100);
    }
  }, [messages, user.uid]);

  useEffect(() => {
    if (messages.length && scrollAreaRef.current) {
      scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, "auto");
      setNewMessagesCount(0);
      lastMessageCountRef.current = messages.length;
    }
  }, [activeChat, isLoading]);

  return {
    username,
    activeChat,
    messages,
    sendMessage: handleSendMessage,
    setNewMessage,
    newMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
    scrollAreaRef,
    isLoading,
    chatdet,
    newMessagesCount,
    scrollToBottom: (behavior) => scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, behavior),
    groupedMessages,
    formatMessageTime,
    user,
    error,
    isAtBottom,
    markMessageAsRead: handleMarkMessageAsRead,
    isOpponentOnline,
    lastOnline,
  };
};

export default useChatWindow;