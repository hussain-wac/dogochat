import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { chatdetails, globalState } from "../jotai/globalState";
import { collection, addDoc, query, orderBy } from "firebase/firestore";
import { useAtomValue } from "jotai";
import useSWR from "swr";
import { onSnapshot } from "firebase/firestore";

const fetchMessages = (activeChat, setMessages) => {
  if (!activeChat) return;

  const messagesRef = collection(db, "chats", activeChat, "messages");
  const q = query(messagesRef, orderBy("timestamp"));

  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      resolve(msgs);
    });
    return () => unsubscribe();
  });
};

const useChatWindow = (activeChat) => {
  const user = useAtomValue(globalState);
  const chatdet = useAtomValue(chatdetails);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const { data, error, isLoading } = useSWR(
    activeChat ? ["messages", activeChat] : null,
    () => fetchMessages(activeChat, setMessages)
  );

  // Get the scrollable element from ScrollArea
  const getScrollElement = () => {
    return scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") || null;
  };

  // Smooth scroll to bottom
  const scrollToBottom = (behavior = "smooth") => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior,
      });
      // Ensure badge hides after scrolling to bottom
      setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          setNewMessagesCount(0);
          setIsAtBottom(true);
        }
      }, 300); // Delay to allow scroll animation to complete
    }
  };

  // Check if user is near the bottom
  const handleScroll = () => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setIsAtBottom(isBottom);
      if (isBottom) {
        setNewMessagesCount(0); // Hide badge when user scrolls to bottom
      }
    }
  };

  // Send message and scroll with animation
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      await addDoc(collection(db, "chats", activeChat, "messages"), {
        sender: user.uid,
        text: newMessage,
        timestamp: new Date(),
      });
      setNewMessage("");
      setTimeout(() => scrollToBottom("smooth"), 100); // Delay for message to render
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle new incoming messages
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;

    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage.sender === user.uid;

    if (isLastMessageFromUser) {
      setTimeout(() => scrollToBottom("smooth"), 100); // Smooth scroll for sender
    } else {
      setNewMessagesCount((prev) => prev + 1); // Always show badge for receiver
    }
  }, [messages, user.uid]);

  // Initial scroll to bottom when chat loads
  useEffect(() => {
    if (messages.length && scrollAreaRef.current) {
      scrollToBottom("auto"); // Instant scroll on load
    }
  }, [activeChat, isLoading]);

  return {
    messages,
    sendMessage,
    setMessages,
    newMessage,
    setNewMessage,
    scrollAreaRef,
    user,
    isLoading,
    error,
    chatdet,
    isAtBottom,
    newMessagesCount,
    handleScroll,
    scrollToBottom,
  };
};

export default useChatWindow;