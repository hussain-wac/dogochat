import { useState, useRef, useEffect, useMemo } from "react";
import { chatdetails, globalState } from "../jotai/globalState";
import { useAtomValue } from "jotai";
import { fetchMessages } from "./utils/messageFetch";
import { formatMessageTime } from "./utils/timeFormat";
import { sendMessage, markMessageAsRead, fetchChatId } from "./utils/chatOperations";
import { getScrollElement, checkIsAtBottom, scrollToBottom } from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import { ref, onValue } from "firebase/database";
import { db, realtimeDb } from "../firebase";

const useChatWindow = (initialUsername) => {
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

  // Fetch chat ID
  useEffect(() => {
    if (!initialUsername || !user) return;
    fetchChatId(db, user, initialUsername, setActiveChat);
  }, [initialUsername, user]);

  // Presence listener
  useEffect(() => {
    if (!initialUsername || !user) return;

    const lowercaseUsername = initialUsername.toLowerCase();
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
  }, [initialUsername, user]);

  // Real-time messages listener
  useEffect(() => {
    if (!activeChat) return;

    const unsubscribe = fetchMessages(db, activeChat, (msgs) => {
      setMessages(msgs);
    });

    return () => {
      unsubscribe();
    };
  }, [activeChat]);

  // Mark unread messages as read
  useEffect(() => {
    if (!activeChat || !messages.length || !user.uid || hasMarkedRead.current) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
    );
    if (unreadMessages.length > 0) {
      Promise.all(
        unreadMessages.map((msg) => markMessageAsRead(db, activeChat, msg.id, user.uid))
      ).then(() => {
        hasMarkedRead.current = true;
      });
    } else {
      hasMarkedRead.current = true;
    }
  }, [activeChat, messages, user.uid]);

  useEffect(() => {
    hasMarkedRead.current = false;
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

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = observeMessages(messages, user.uid, handleMarkMessageAsRead, scrollAreaRef);

    const scrollElement = getScrollElement(scrollAreaRef);
    if (scrollElement) {
      const messageElements = scrollElement.querySelectorAll("[data-message-id]");
      messageElements.forEach((element) => observerRef.current.observe(element));
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
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
  }, [activeChat]);

  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;

    const scrollElement = getScrollElement(scrollAreaRef);
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage?.sender === user.uid;


    if (isLastMessageFromUser) {
      setTimeout(() => scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, "smooth"), 100);
    } else if (!isAtBottom) {
      const unreadCount = messages.filter(
        (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
      ).length;
      setNewMessagesCount(unreadCount > 0 ? unreadCount : messages.length - lastMessageCountRef.current);
    }

    lastMessageCountRef.current = messages.length;
  }, [messages, user.uid, activeChat]);

  useEffect(() => {
    if (messages.length && scrollAreaRef.current && activeChat) {
      scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, "auto");
      setNewMessagesCount(0);
      lastMessageCountRef.current = messages.length;
    }
  }, [activeChat]);

  return {
    username: initialUsername,
    activeChat,
    setActiveChat,
    messages,
    sendMessage: handleSendMessage,
    setNewMessage,
    newMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
    scrollAreaRef,
    isLoading: !activeChat || !messages, // Simplified loading state
    chatdet,
    newMessagesCount,
    scrollToBottom: (behavior) => scrollToBottom(scrollAreaRef, setNewMessagesCount, setIsAtBottom, behavior),
    groupedMessages,
    formatMessageTime,
    user,
    isAtBottom,
    markMessageAsRead: handleMarkMessageAsRead,
    isOpponentOnline,
    lastOnline,
  };
};

export default useChatWindow;