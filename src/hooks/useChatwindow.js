import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { db } from "../firebase";
import { chatdetails, globalState } from "../jotai/globalState";
import {
  collection,
  addDoc,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { useAtomValue } from "jotai";
import useSWR from "swr";
import { onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";

const fetchMessages = (activeChat, setMessages) => {
  if (!activeChat) return;

  const messagesRef = collection(db, "chats", activeChat, "messages");
  const q = query(messagesRef, orderBy("timestamp"));

  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate
          ? doc.data().timestamp.toDate()
          : doc.data().timestamp,
      }));
      setMessages(msgs);
      resolve(msgs);
    });
    return () => unsubscribe();
  });
};

const formatMessageTime = (timestamp) => {
  const date =
    timestamp instanceof Date
      ? timestamp
      : typeof timestamp === "string"
      ? new Date(timestamp)
      : timestamp.toDate();

  const now = new Date();
  const diffSeconds = (now.getTime() - date.getTime()) / 1000;

  if (diffSeconds < 30) return "Just now";
  if (diffSeconds < 60) return "1 min ago";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;

  const hours = Math.floor(diffSeconds / 3600);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

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

  const { data, error, isLoading } = useSWR(
    activeChat ? ["messages", activeChat] : null,
    () => fetchMessages(activeChat, setMessages),
    {
      revalidateOnFocus: false, 
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    const fetchChatId = async () => {
      if (!user?.uid || !username) {
        console.log("Missing user UID or username:", { user, username });
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.log("User document does not exist for UID:", user.uid);
          return;
        }

        const chatList = userDoc.data().chatlist || [];
        console.log("Chat list:", chatList);

        const chat = chatList.find((c) => c.name === username);
        if (chat) {
          console.log("Found chat:", chat);
          setActiveChat(chat.refid);
        } else {
          console.log("No chat found for username:", username);
        }
      } catch (err) {
        console.error("Error fetching chat ID:", err);
      }
    };

    fetchChatId();
  }, [username, user]);

  // Log state for debugging
  useEffect(() => {
    console.log("Current state:", { username, activeChat, isLoading, messages });
  }, [username, activeChat, isLoading, messages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((msg) => {
      const date = msg.timestamp.toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  // Scroll utilities
  const getScrollElement = useCallback(() => {
    return (
      scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) || null
    );
  }, []);

  const checkIsAtBottom = useCallback(() => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      return scrollTop + clientHeight >= scrollHeight - 10;
    }
    return true;
  }, [getScrollElement]);

  const scrollToBottom = useCallback(
    (behavior = "smooth") => {
      const scrollElement = getScrollElement();
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior,
        });
        setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollElement;
          if (scrollTop + clientHeight >= scrollHeight - 10) {
            setNewMessagesCount(0);
            setIsAtBottom(true);
          }
        }, 300);
      }
    },
    [getScrollElement]
  );

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      const messageRef = await addDoc(
        collection(db, "chats", activeChat, "messages"),
        {
          sender: user.uid,
          text: newMessage,
          timestamp: new Date(),
          status: "sent",
          readBy: [user.uid],
        }
      );

      setTimeout(async () => {
        await updateDoc(messageRef, {
          status: "delivered",
        });
      }, 1000);

      setNewMessage("");
      setTimeout(() => scrollToBottom("smooth"), 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [activeChat, newMessage, user.uid, scrollToBottom]);

  // Mark message as read
  const markMessageAsRead = useCallback(
    async (messageId) => {
      if (!activeChat) return;
      try {
        const messageRef = doc(db, "chats", activeChat, "messages", messageId);
        await updateDoc(messageRef, {
          status: "read",
          readBy: arrayUnion(user.uid),
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    },
    [activeChat, user.uid]
  );

  const handleEmojiClick = useCallback((emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  useEffect(() => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      const handleScroll = () => {
        const isBottom = checkIsAtBottom();
        setIsAtBottom(isBottom);
        if (isBottom) setNewMessagesCount(0);
      };
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [activeChat, isLoading, checkIsAtBottom, getScrollElement]);

  // Message update logic
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;

    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const currentIsAtBottom = checkIsAtBottom();
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage.sender === user.uid;

    if (!isLastMessageFromUser) {
      if (
        !currentIsAtBottom &&
        messages.length !== lastMessageCountRef.current
      ) {
        setNewMessagesCount((prev) => prev + 1);
      }

      if (currentIsAtBottom) {
        messages.forEach((msg) => {
          if (
            msg.sender !== user.uid &&
            (!msg.readBy || !msg.readBy.includes(user.uid))
          ) {
            markMessageAsRead(msg.id);
          }
        });
      }
    }

    lastMessageCountRef.current = messages.length;

    if (isLastMessageFromUser) {
      setTimeout(() => scrollToBottom("smooth"), 100);
    }

    setIsAtBottom(currentIsAtBottom);
  }, [
    messages,
    user.uid,
    checkIsAtBottom,
    scrollToBottom,
    getScrollElement,
    markMessageAsRead,
  ]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length && scrollAreaRef.current) {
      scrollToBottom("auto");
      setNewMessagesCount(0);
      lastMessageCountRef.current = messages.length;
    }
  }, [activeChat, isLoading, scrollToBottom]);

  return {
    username,
    activeChat,
    messages,
    sendMessage,
    setNewMessage,
    newMessage,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiClick,
    scrollAreaRef,
    isLoading,
    chatdet,
    newMessagesCount,
    scrollToBottom,
    groupedMessages,
    formatMessageTime,
    user,
    error,
    isAtBottom,
    markMessageAsRead,
  };
};

export default useChatWindow;