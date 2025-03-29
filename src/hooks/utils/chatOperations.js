import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

export const sendMessage = async (db, activeChat, newMessage, userId, scrollToBottom) => {
  if (!newMessage.trim() || !activeChat) return;

  try {
    const messageRef = await addDoc(
      collection(db, "chats", activeChat, "messages"),
      {
        sender: userId,
        text: newMessage,
        timestamp: new Date(),
        status: "sent",
        readBy: [userId], // Sender has "read" it by default
      }
    );

    // Check the message status before updating to "delivered"
    setTimeout(async () => {
      const messageDoc = await getDoc(messageRef);
      const currentStatus = messageDoc.data().status;

      // Only update to "delivered" if it hasn't been marked as "read"
      if (currentStatus === "sent") {
        await updateDoc(messageRef, {
          status: "delivered",
        });
      }
    }, 1000);

    setTimeout(() => scrollToBottom("smooth"), 100);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

export const markMessageAsRead = async (db, activeChat, messageId, userId) => {
  if (!activeChat) return;
  try {
    const messageRef = doc(db, "chats", activeChat, "messages", messageId);
    await updateDoc(messageRef, {
      status: "read",
      readBy: arrayUnion(userId),
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
};

export const fetchChatId = async (db, user, username, setActiveChat) => {
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

    const chat = chatList.find((c) => c.name === username);
    if (chat) {
      setActiveChat(chat.refid);
    } else {
      console.log("No chat found for username:", username);
    }
  } catch (err) {
    console.error("Error fetching chat ID:", err);
  }
};