import { useState, useRef, useEffect, useCallback } from "react";
import { db } from "../firebase";
import { chatdetails, globalState } from "../jotai/globalState";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  updateDoc, 
  doc,
  arrayUnion 
} from "firebase/firestore";
import { useAtomValue } from "jotai";
import useSWR from "swr";
import { onSnapshot } from "firebase/firestore";

const fetchMessages = (activeChat, setMessages) => {
  if (!activeChat) return;

  const messagesRef = collection(db, "chats", activeChat, "messages");
  const q = query(messagesRef, orderBy("timestamp"));

  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate ? doc.data().timestamp.toDate() : doc.data().timestamp
      }));
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
  const lastMessageCountRef = useRef(0);
  const lastReadMessageRef = useRef(null);

  const { data, error, isLoading } = useSWR(
    activeChat ? ["messages", activeChat] : null,
    () => fetchMessages(activeChat, setMessages)
  );

  const getScrollElement = useCallback(() => {
    return (
      scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) || null
    );
  }, [scrollAreaRef]);

  const checkIsAtBottom = useCallback(() => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      return scrollTop + clientHeight >= scrollHeight - 10;
    }
    return true;
  }, [getScrollElement]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
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
  }, [getScrollElement]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      const messageRef = await addDoc(collection(db, "chats", activeChat, "messages"), {
        sender: user.uid,
        text: newMessage,
        timestamp: new Date(),
        status: 'sent', // Initial status is 'sent'
        readBy: [user.uid]
      });
      
      // Update the message status to 'delivered' after a short delay
      setTimeout(async () => {
        await updateDoc(messageRef, {
          status: 'delivered'
        });
      }, 1000);

      setNewMessage("");
      setTimeout(() => scrollToBottom("smooth"), 100);
      return messageRef;
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [activeChat, newMessage, user.uid, scrollToBottom]);

  const markMessageAsRead = useCallback(async (messageId) => {
    if (!activeChat) return;
    try {
      const messageRef = doc(db, "chats", activeChat, "messages", messageId);
      await updateDoc(messageRef, {
        status: 'read', // Update status to 'read'
        readBy: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, [activeChat, user.uid]);

  // Scroll event listener
  useEffect(() => {
    const scrollElement = getScrollElement();
    if (scrollElement) {
      const handleScroll = () => {
        const isBottom = checkIsAtBottom();
        setIsAtBottom(isBottom);
        if (isBottom) {
          setNewMessagesCount(0);
        }
      };
      
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [activeChat, isLoading, checkIsAtBottom, getScrollElement]);

  // Handle new messages and read status
  useEffect(() => {
    if (!messages.length || !scrollAreaRef.current) return;

    const scrollElement = getScrollElement();
    if (!scrollElement) return;

    const currentIsAtBottom = checkIsAtBottom();
    const lastMessage = messages[messages.length - 1];
    const isLastMessageFromUser = lastMessage.sender === user.uid;

    // Only track new messages from other users
    if (!isLastMessageFromUser) {
      // If not at bottom and message count changed, increment new messages
      if (!currentIsAtBottom && messages.length !== lastMessageCountRef.current) {
        setNewMessagesCount((prev) => prev + 1);
      }
      
      // Automatically mark messages as read when at bottom
      if (currentIsAtBottom) {
        messages.forEach(msg => {
          if (msg.sender !== user.uid && (!msg.readBy || !msg.readBy.includes(user.uid))) {
            markMessageAsRead(msg.id);
          }
        });
      }
    }

    // Update last message count
    lastMessageCountRef.current = messages.length;

    // Automatically scroll for user's own messages
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
    markMessageAsRead
  ]);

  // Initial scroll when chat changes or loads
  useEffect(() => {
    if (messages.length && scrollAreaRef.current) {
      scrollToBottom("auto");
      setNewMessagesCount(0);
      lastMessageCountRef.current = messages.length;
    }
  }, [activeChat, isLoading, scrollToBottom]);

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
    scrollToBottom,
    markMessageAsRead,
  };
};

export default useChatWindow;