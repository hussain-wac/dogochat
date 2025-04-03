// useMessageHandlers.js
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import {
  sendMessage,
  markMessageAsRead,
  deleteMessages,
} from "./utils/chatOperations";
import { scrollToBottom } from "./utils/scrollUtils";

const useMessageHandlers = ({
  db,
  activeChat,
  newMessage,
  setNewMessage,
  scrollAreaRef,
  setNewMessagesCount,
  setIsAtBottom,
  selectedMessages,
  setSelectedMessages,
  setIsSelectionMode,
}) => {
  const currentUser = useAtomValue(globalState);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat || !currentUser?.uid) return;
    sendMessage(db, activeChat, newMessage, currentUser.uid, (behavior) =>
      scrollToBottom(
        scrollAreaRef,
        setNewMessagesCount,
        setIsAtBottom,
        behavior
      )
    );
    setNewMessage("");
  };

  const handleMarkMessageAsRead = (messageId) => {
    if (!activeChat || !messageId || !currentUser?.uid) return;
    markMessageAsRead(db, activeChat, messageId, currentUser.uid);
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0 || !activeChat) return;
    try {
      await deleteMessages(db, activeChat, selectedMessages);
      setSelectedMessages([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedMessages([]);
  };

  return {
    handleSendMessage,
    handleMarkMessageAsRead,
    toggleMessageSelection,
    handleDeleteMessages,
    toggleSelectionMode,
  };
};

export default useMessageHandlers;
