// useMessageHandlers.js
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import { sendMessage, markMessageAsRead, deleteMessages } from "./utils/chatOperations";
import { scrollToBottom } from "./utils/scrollUtils";

const useMessageHandlers = ({
  db,
  activeChat,
  newMessage,
  setNewMessage,
  user,
  scrollAreaRef,
  setNewMessagesCount,
  setIsAtBottom,
  setShowEmojiPicker,
  selectedMessages,
  setSelectedMessages,
  setIsSelectionMode,
  setMessages
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

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
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
    handleEmojiClick,
    toggleMessageSelection,
    handleDeleteMessages,
    toggleSelectionMode
  };
};

export default useMessageHandlers;