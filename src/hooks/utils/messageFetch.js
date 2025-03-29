import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export const fetchMessages = (db, chatId, setMessages) => {
  if (!chatId) return () => {};

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));
    setMessages(fetchedMessages);
  }, (error) => {
    console.error(`Error fetching messages for chatId: ${chatId}`, error);
  });

  return unsubscribe;
};