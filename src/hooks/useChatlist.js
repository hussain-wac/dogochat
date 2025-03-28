import useSWR from "swr";
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const fetchChatList = async (uid) => {
  if (!uid) throw new Error("No user ID");

  const userDocRef = doc(db, "users", uid);
  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const rawChatList = docSnap.data().chatlist || [];
          // Deduplicate based on refid
          const uniqueChatList = rawChatList.reduce((acc, chat) => {
            if (!acc.some((item) => item.refid === chat.refid)) {
              acc.push({ ...chat, name: chat.name.toLowerCase() });
            }
            return acc;
          }, []);

          // Fetch last message and unread count for each chat
          const enrichedChatList = await Promise.all(
            uniqueChatList.map(async (chat) => {
              const messagesRef = collection(db, "chats", chat.refid, "messages");
              const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
              const messagesSnap = await getDocs(q);
              const lastMessage = messagesSnap.docs[0]?.data() || null;

              // Count unread messages (assuming 'read' field exists)
              const allMessagesSnap = await getDocs(collection(db, "chats", chat.refid, "messages"));
              const unreadCount = allMessagesSnap.docs.filter(
                (doc) => !doc.data().read && doc.data().sender !== uid
              ).length;

              return {
                ...chat,
                lastMessage: lastMessage ? {
                  text: lastMessage.text,
                  timestamp: lastMessage.timestamp.toDate(),
                } : null,
                unreadCount,
              };
            })
          );

          // Sort by last message timestamp (newest first)
          enrichedChatList.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp || 0;
            const timeB = b.lastMessage?.timestamp || 0;
            return timeB - timeA;
          });

          resolve(enrichedChatList);
        } else {
          resolve([]);
        }
      },
      (error) => reject(error)
    );

    return () => unsubscribe();
  });
};

const useChatList = () => {
  const user = useAtomValue(globalState);

  const { data: chatList = [], error, isLoading, mutate } = useSWR(
    user?.uid ? `chatList-${user.uid}` : null,
    () => fetchChatList(user.uid),
    {
      revalidateOnFocus: true,
      dedupingInterval: 100,
    }
  );

  const deleteChat = async (chatRefId) => {
    if (!user?.uid) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        chatlist: chatList.filter((chat) => chat.refid !== chatRefId),
      });

      mutate(); // Revalidate the chat list
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return { chatList, isLoading, deleteChat, mutate };
};

export default useChatList;