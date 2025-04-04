import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit, 
  getDocs, 
  where, 
  startAfter,
  endBefore,
  limitToLast,
  Timestamp
} from "firebase/firestore";

// Fetch the most recent messages for initial load
export const fetchMessages = (db, chatId, messagesPerPage, setMessages) => {
  if (!chatId) return () => {};

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef, 
    orderBy("timestamp", "asc"),
    limitToLast(messagesPerPage)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));
    
    // Get the oldest timestamp for pagination
    const oldestTimestamp = fetchedMessages.length > 0 
      ? fetchedMessages[0].timestamp 
      : null;

    console.log(`Initial fetch: ${fetchedMessages.length} messages, oldest timestamp:`, oldestTimestamp);
    setMessages(fetchedMessages, oldestTimestamp);
  }, (error) => {
    console.error(`Error fetching messages for chatId: ${chatId}`, error);
  });

  return unsubscribe;
};

// Fetch older messages for infinite scrolling
export const fetchOlderMessages = async (db, chatId, oldestTimestamp, messagesPerPage) => {
  if (!chatId || !oldestTimestamp) {
    console.log("Cannot fetch older messages: missing chatId or timestamp");
    return { olderMessages: [], oldestTimestamp: null };
  }

  // Convert to Firestore Timestamp if it's a Date
  const firestoreTimestamp = oldestTimestamp instanceof Date 
    ? Timestamp.fromDate(oldestTimestamp)
    : oldestTimestamp;

  console.log("Fetching messages before:", firestoreTimestamp);

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    orderBy("timestamp", "asc"),
    endBefore(firestoreTimestamp),
    limitToLast(messagesPerPage)
  );

  try {
    const snapshot = await getDocs(q);
    console.log(`Got ${snapshot.docs.length} older messages`);
    
    const olderMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));

    // Get the new oldest timestamp for next pagination
    const newOldestTimestamp = olderMessages.length > 0 
      ? olderMessages[0].timestamp 
      : oldestTimestamp;

    return { 
      olderMessages, 
      oldestTimestamp: newOldestTimestamp 
    };
  } catch (error) {
    console.error(`Error fetching older messages for chatId: ${chatId}`, error);
    return { 
      olderMessages: [], 
      oldestTimestamp 
    };
  }
};