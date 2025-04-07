// chatOperations.js
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export const sendMessage = async (
  db,
  chatId,
  content,
  type = "text",
  userId,
  onComplete
) => {
  try {
    const payload = {
      sender: userId,
      timestamp: new Date(),
      status: "sent",
      readBy: [userId],
      type,
      text: type === "text" ? content : "",
      imageUrl: type === "image" ? content : "",
    };

    const ref = await addDoc(
      collection(db, "chats", chatId, "messages"),
      payload
    );
    console.log(`Message sent with ID: ${ref.id}`);
    onComplete?.();

    setTimeout(async () => {
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().status === "sent") {
        await updateDoc(ref, { status: "delivered" });
        console.log(`Message ${ref.id} updated to delivered`);
      }
    }, 1000);

    return ref.id;
  } catch (error) {
    console.error("Send message error:", error);
    throw error;
  }
};

export const markMessageAsRead = async (db, activeChat, messageId, userId) => {
  if (!db || !activeChat || !messageId || !userId) {
    console.error("Missing required parameters:", {
      db,
      activeChat,
      messageId,
      userId,
    });
    return false;
  }

  try {
    const messageRef = doc(db, "chats", activeChat, "messages", messageId);
    const messageSnap = await getDoc(messageRef);

    if (!messageSnap.exists()) {
      console.warn(`Message ${messageId} does not exist`);
      return false;
    }

    const data = messageSnap.data();
    if (!data.readBy?.includes(userId)) {
      await updateDoc(messageRef, {
        status: "read",
        readBy: arrayUnion(userId),
      });
      console.log(`Message ${messageId} marked as read by ${userId}`);
      return true;
    }
    console.log(`Message ${messageId} already read by ${userId}`);
    return false;
  } catch (error) {
    console.error(`Error marking message ${messageId} as read:`, error);
    return false;
  }
};

export const deleteMessages = async (db, chatId, messageIds) => {
  try {
    await Promise.all(
      messageIds.map(async (messageId) => {
        const messageRef = doc(db, "chats", chatId, "messages", messageId);
        await deleteDoc(messageRef);
      })
    );
    console.log("Messages deleted successfully");
  } catch (error) {
    throw new Error("Failed to delete messages: " + error.message);
  }
};

export const fetchChatId = async (db, user, username, setActiveChat) => {
  if (!user?.uid || !username) {
    console.log("Missing user UID or username:", { user, username });
    return null;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("User document does not exist for UID:", user.uid);
      return null;
    }

    const chatList = userDoc.data().chatlist || [];
    const chat = chatList.find((c) => c.name === username);
    
    if (chat) {
      setActiveChat(chat.refid);
      return chat.refid;
    }
    console.log("No chat found for username:", username);
    return null;
  } catch (err) {
    console.error("Error fetching chat ID:", err);
    return null;
  }
};