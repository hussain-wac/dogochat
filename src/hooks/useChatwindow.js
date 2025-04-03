import { useState, useRef, useEffect, useMemo } from "react";
import { chatdetails, globalState } from "../jotai/globalState";
import { useAtomValue } from "jotai";
import { fetchMessages } from "./utils/messageFetch";
import { formatMessageTime } from "./utils/timeFormat";
import { markMessageAsRead, fetchChatId } from "./utils/chatOperations";
import {
  getScrollElement,
  checkIsAtBottom,
  scrollToBottom,
} from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";
import { ref, onValue } from "firebase/database";
import { db, realtimeDb } from "../firebase";
import useMessageHandlers from "./useMessageHanlders";
const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const chatdet = useAtomValue(chatdetails);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const observerRef = useRef(null);
  const [isOpponentOnline, setIsOpponentOnline] = useState(false);
  const [lastOnline, setLastOnline] = useState(null);
  const hasMarkedRead = useRef(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const previousMessagesLength = useRef(0);

  const {
    handleSendMessage,
    handleMarkMessageAsRead,
    handleEmojiClick,
    toggleMessageSelection,
    handleDeleteMessages,
    toggleSelectionMode,
  } = useMessageHandlers({
    db,
    activeChat,
    newMessage,
    setNewMessage,
    user,
    scrollAreaRef,
    setNewMessagesCount,
    setIsAtBottom,
    selectedMessages,
    setSelectedMessages,
    setIsSelectionMode,
    setMessages,
  });

  // Fetch chat ID
  useEffect(() => {
    if (!initialUsername || !user) return;
    fetchChatId(db, user, initialUsername, setActiveChat);
  }, [initialUsername, user]);

  // Presence listener
  useEffect(() => {
    if (!initialUsername || !user) return;
    const presenceRef = ref(
      realtimeDb,
      `presence/${initialUsername.toLowerCase()}`
    );
    const handlePresenceChange = (snapshot) => {
      const data = snapshot.val();
      setIsOpponentOnline(data?.online || false);
      setLastOnline(data?.lastOnline || null);
    };
    const unsubscribe = onValue(presenceRef, handlePresenceChange);
    return () => unsubscribe();
  }, [initialUsername, user]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat) return;
    const unsubscribe = fetchMessages(db, activeChat, setMessages);
    return () => unsubscribe();
  }, [activeChat]);

  // Mark messages as read
  useEffect(() => {
    if (!activeChat || !messages.length || hasMarkedRead.current) return;

    const unreadMessages = messages.filter(
      (msg) => !msg.readBy?.includes(user.uid) && msg.sender !== user.uid
    );

    if (unreadMessages.length > 0) {
      Promise.all(
        unreadMessages.map((msg) =>
          markMessageAsRead(db, activeChat, msg.id, user.uid)
        )
      ).then(() => {
        hasMarkedRead.current = true;
        setNewMessagesCount(0);
      });
    } else {
      hasMarkedRead.current = true;
      setNewMessagesCount(0);
    }
  }, [messages, activeChat, user.uid]);

  useEffect(() => {
    hasMarkedRead.current = false;
  }, [activeChat]);

  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return {};
    return messages.reduce((groups, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      groups[date] = groups[date] || [];
      groups[date].push(msg);
      return groups;
    }, {});
  }, [messages]);

  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = observeMessages(
      messages,
      user.uid,
      handleMarkMessageAsRead,
      scrollAreaRef
    );

    const scrollElement = getScrollElement(scrollAreaRef);
    scrollElement
      ?.querySelectorAll("[data-message-id]")
      .forEach((element) => observerRef.current.observe(element));

    return () => observerRef.current?.disconnect();
  }, [messages, activeChat, user.uid, handleMarkMessageAsRead]);

  // Detect scrolling to update isAtBottom state
  useEffect(() => {
    if (!scrollAreaRef.current || !messages.length || !activeChat) return;

    const scrollElement = getScrollElement(scrollAreaRef);
    if (!scrollElement) return;

    const handleScroll = () => {
      const isBottom = checkIsAtBottom(scrollAreaRef);
      setIsAtBottom(isBottom);
      if (isBottom) {
        setNewMessagesCount(0);
      }
    };

    scrollElement.addEventListener("scroll", handleScroll);
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [activeChat, messages]);

  // Handle new messages count logic using message length difference
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;

    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage?.sender === user.uid;
    const newCount = messages.length - previousMessagesLength.current;
    previousMessagesLength.current = messages.length;

    if (isAtBottom) {
      setNewMessagesCount(0);
    } else if (!isLastMessageFromUser && newCount > 0) {
      setNewMessagesCount((prevCount) => prevCount + newCount);
    }
  }, [messages, user.uid, activeChat, isAtBottom]);

  // Auto-scroll when new messages arrive from the user
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === user.uid) {
      setTimeout(() => {
        scrollToBottom(
          scrollAreaRef,
          setNewMessagesCount,
          setIsAtBottom,
          "smooth"
        );
      }, 100);
    }
  }, [messages, user.uid, activeChat]);
  return {
    username: initialUsername,
    activeChat,
    setActiveChat,
    messages,
    sendMessage: handleSendMessage,
    setNewMessage,
    newMessage,
    scrollAreaRef,
    isLoading: !activeChat || !messages,
    chatdet,
    newMessagesCount,
    scrollToBottom: (behavior) =>
      scrollToBottom(
        scrollAreaRef,
        setNewMessagesCount,
        setIsAtBottom,
        behavior
      ),
    groupedMessages,
    formatMessageTime,
    user,
    isAtBottom,
    markMessageAsRead: handleMarkMessageAsRead,
    isOpponentOnline,
    lastOnline,
    selectedMessages,
    toggleMessageSelection,
    handleDeleteMessages,
    isSelectionMode,
    toggleSelectionMode,
  };
};
export default useChatWindow;
