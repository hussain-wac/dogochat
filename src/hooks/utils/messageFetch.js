import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export const fetchMessages = (db, activeChat, setMessages) => {
  if (!activeChat) return;

  const messagesRef = collection(db, "chats", activeChat, "messages");
  const q = query(messagesRef, orderBy("timestamp"));

  return new Promise((resolve) => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate
          ? doc.data().timestamp.toDate()
          : doc.data().timestamp,
      }));
      setMessages(msgs);
      resolve(msgs);
    });
    return () => unsubscribe();
  });
};