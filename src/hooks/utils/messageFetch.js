import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limitToLast, 
  getDocs, 
  endBefore, 
  Timestamp 
} from "firebase/firestore";


export const fetchMessages = (db, chatId, messagesPerPage, callback) => {
  if (!chatId) return () => {};

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    orderBy("timestamp", "asc"),
    limitToLast(messagesPerPage)
  );

  // Initial fetch to load messages immediately
  const fetchInitialMessages = async () => {
    try {
      const snapshot = await getDocs(q);
      const initialMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));
      callback(initialMessages);
    } catch (error) {
      console.error(`Error fetching initial messages for chatId: ${chatId}`, error);
    }
  };

  // Call the initial fetch
  fetchInitialMessages();

  // Set up real-time listener for subsequent updates
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));
    callback(fetchedMessages);
  }, (error) => {
    console.error(`Error in real-time listener for chatId: ${chatId}`, error);
  });

  return unsubscribe;
};

// Fetch older messages for infinite scrolling (unchanged)
export const fetchOlderMessages = async (db, chatId, oldestTimestamp, messagesPerPage) => {
  if (!chatId || !oldestTimestamp) {
    return { olderMessages: [], oldestTimestamp: null };
  }

  const firestoreTimestamp = oldestTimestamp instanceof Date 
    ? Timestamp.fromDate(oldestTimestamp)
    : oldestTimestamp;

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    orderBy("timestamp", "asc"),
    endBefore(firestoreTimestamp),
    limitToLast(messagesPerPage)
  );

  try {
    const snapshot = await getDocs(q);
    const olderMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));

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