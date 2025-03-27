import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { chatname, globalState } from "../jotai/globalState";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useAtomValue } from "jotai";
const useChatWindow = (activeChat) => {
  const user = useAtomValue(globalState);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);
  const chatnameval =  useAtomValue(chatname);
  useEffect(() => {
    if (!activeChat) return;

    const messagesRef = collection(db, "chats", activeChat, "messages");
    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;
    try {
      await addDoc(collection(db, "chats", activeChat, "messages"), {
        sender: user.uid,
        text: newMessage,
        timestamp: new Date(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  return {
    messages,
    sendMessage,
    setMessages,
    newMessage,
    setNewMessage,
    scrollAreaRef,
    user,chatnameval
  };
};

export default useChatWindow;
