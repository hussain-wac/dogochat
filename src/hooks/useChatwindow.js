import React, { useState, useRef } from "react";
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
  const chatdet = useAtomValue(chatdetails)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef(null);

  const { data, error, isLoading } = useSWR(activeChat ? ["messages", activeChat] : null, () => fetchMessages(activeChat, setMessages));

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
    user,
    
    isLoading,
    error,
    chatdet
  };
};

export default useChatWindow;
