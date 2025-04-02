import { useState, useRef, useMemo } from "react";
import { chatdetails, globalState } from "../jotai/globalState";
import { useAtomValue } from "jotai";
import { ref, onValue } from "firebase/database";
import { db, realtimeDb } from "../firebase";
import { 
  fetchMessages, 
  formatMessageTime, 
  sendMessage, 
  markMessageAsRead, 
  fetchChatId, 
  deleteMessages 
} from "./utils/chatOperations";
import { getScrollElement, checkIsAtBottom, scrollToBottom } from "./utils/scrollUtils";
import { observeMessages } from "./utils/intersectionUtils";

const initializeChatState = () => ({
  activeChat: null,
  messages: [],
  newMessage: "",
  showEmojiPicker: false,
  isAtBottom: true,
  newMessagesCount: 0,
  isOpponentOnline: false,
  lastOnline: null,
  selectedMessages: [],
  isSelectionMode: false
});

// Utility to manage chat ID
const manageChatId = (db, user, initialUsername, setActiveChat) => {
  if (!initialUsername || !user) return;
  fetchChatId(db, user, initialUsername, setActiveChat);
};

// Utility to handle presence
const setupPresenceListener = (initialUsername, setIsOpponentOnline, setLastOnline) => {
  if (!initialUsername) return () => {};
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
  return unsubscribe;
};

// Utility to handle real-time messages
const setupMessagesListener = (db, activeChat, setMessages) => {
  if (!activeChat) return () => {};
  return fetchMessages(db, activeChat, setMessages);
};

// Utility to mark messages as read
const markUnreadMessages = (db, activeChat, messages, userId, hasMarkedRead) => {
  if (!activeChat || !messages.length || !userId || hasMarkedRead.current) return;
  const unreadMessages = messages.filter(
    (msg) => !msg.readBy?.includes(userId) && msg.sender !== userId
  );
  if (unreadMessages.length > 0) {
    Promise.all(
      unreadMessages.map((msg) => markMessageAsRead(db, activeChat, msg.id, userId))
    ).then(() => {
      hasMarkedRead.current = true;
    });
  } else {
    hasMarkedRead.current = true;
  }
};

// Utility to group messages
const groupMessages = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const date = msg.timestamp.toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

// Main hook
const useChatWindow = (initialUsername) => {
  const user = useAtomValue(globalState);
  const chatdet = useAtomValue(chatdetails);
  const [state, setState] = useState(initializeChatState());
  const scrollAreaRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const observerRef = useRef(null);
  const hasMarkedRead = useRef(false);

  // Initialize chat ID
  manageChatId(db, user, initialUsername, (chatId) => 
    setState(prev => ({ ...prev, activeChat: chatId }))
  );

  // Setup presence listener
  const unsubscribePresence = setupPresenceListener(
    initialUsername,
    (online) => setState(prev => ({ ...prev, isOpponentOnline: online })),
    (last) => setState(prev => ({ ...prev, lastOnline: last }))
  );

  // Setup messages listener
  const unsubscribeMessages = setupMessagesListener(
    db,
    state.activeChat,
    (msgs) => setState(prev => ({ ...prev, messages: msgs }))
  );

  // Mark unread messages
  markUnreadMessages(db, state.activeChat, state.messages, user?.uid, hasMarkedRead);

  // Group messages
  const groupedMessages = useMemo(() => groupMessages(state.messages), [state.messages]);

  // Message handling functions
  const handleSendMessage = () => {
    sendMessage(db, state.activeChat, state.newMessage, user.uid, (behavior) =>
      scrollToBottom(scrollAreaRef, (count) => setState(prev => ({ ...prev, newMessagesCount: count })), 
      (bottom) => setState(prev => ({ ...prev, isAtBottom: bottom })), behavior)
    );
    setState(prev => ({ ...prev, newMessage: "" }));
  };

  const handleMarkMessageAsRead = (messageId) => {
    markMessageAsRead(db, state.activeChat, messageId, user.uid);
  };

  const handleEmojiClick = (emojiObject) => {
    setState(prev => ({
      ...prev,
      newMessage: prev.newMessage + emojiObject.emoji,
      showEmojiPicker: false
    }));
  };

  const toggleMessageSelection = (messageId) => {
    setState(prev => ({
      ...prev,
      selectedMessages: prev.selectedMessages.includes(messageId)
        ? prev.selectedMessages.filter((id) => id !== messageId)
        : [...prev.selectedMessages, messageId]
    }));
  };

  const handleDeleteMessages = async () => {
    if (state.selectedMessages.length === 0) return;
    try {
      await deleteMessages(db, state.activeChat, state.selectedMessages);
      setState(prev => ({ ...prev, selectedMessages: [], isSelectionMode: false }));
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const toggleSelectionMode = () => {
    setState(prev => ({ 
      ...prev, 
      isSelectionMode: !prev.isSelectionMode,
      selectedMessages: []
    }));
  };

  // Cleanup function
  const cleanup = () => {
    unsubscribePresence();
    unsubscribeMessages();
    if (observerRef.current) observerRef.current.disconnect();
  };

  return {
    username: initialUsername,
    activeChat: state.activeChat,
    setActiveChat: (chat) => setState(prev => ({ ...prev, activeChat: chat })),
    messages: state.messages,
    sendMessage: handleSendMessage,
    setNewMessage: (msg) => setState(prev => ({ ...prev, newMessage: msg })),
    newMessage: state.newMessage,
    showEmojiPicker: state.showEmojiPicker,
    setShowEmojiPicker: (show) => setState(prev => ({ ...prev, showEmojiPicker: show })),
    handleEmojiClick,
    scrollAreaRef,
    isLoading: !state.activeChat || !state.messages,
    chatdet,
    newMessagesCount: state.newMessagesCount,
    scrollToBottom: (behavior) => scrollToBottom(
      scrollAreaRef, 
      (count) => setState(prev => ({ ...prev, newMessagesCount: count })),
      (bottom) => setState(prev => ({ ...prev, isAtBottom: bottom })),
      behavior
    ),
    groupedMessages,
    formatMessageTime,
    user,
    isAtBottom: state.isAtBottom,
    markMessageAsRead: handleMarkMessageAsRead,
    isOpponentOnline: state.isOpponentOnline,
    lastOnline: state.lastOnline,
    selectedMessages: state.selectedMessages,
    toggleMessageSelection,
    handleDeleteMessages,
    isSelectionMode: state.isSelectionMode,
    toggleSelectionMode,
    cleanup // Expose cleanup if needed
  };
};

export default useChatWindow;