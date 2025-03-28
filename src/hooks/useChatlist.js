import useSWR from "swr";
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import { doc, onSnapshot, updateDoc, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

const fetchChatList = (uid, mutate) => {
  if (!uid) throw new Error("No user ID");

  const userDocRef = doc(db, "users", uid);
  let unsubscribeUser = null;
  const chatListeners = new Map();
  let currentChatList = [];

  const updateChatList = (newChatList) => {
    newChatList.sort((a, b) => {
      const timeA = a.lastMessage?.timestamp || 0;
      const timeB = b.lastMessage?.timestamp || 0;
      return timeB - timeA;
    });
    currentChatList = [...newChatList];
    mutate(currentChatList, false);
  };

  unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const rawChatList = docSnap.data().chatlist || [];
      const uniqueChatList = rawChatList.reduce((acc, chat) => {
        if (!acc.some((item) => item.refid === chat.refid)) {
          acc.push({ ...chat, name: chat.name.toLowerCase() });
        }
        return acc;
      }, []);

      const currentChatIds = new Set(uniqueChatList.map((chat) => chat.refid));
      for (const [refid, unsubscribe] of chatListeners) {
        if (!currentChatIds.has(refid)) {
          unsubscribe();
          chatListeners.delete(refid);
        }
      }

      const enrichedChatList = uniqueChatList.map((chat) => {
        const existingChat = currentChatList.find((c) => c.refid === chat.refid) || {};
        const chatData = {
          ...chat,
          lastMessage: existingChat.lastMessage || null,
          unreadCount: existingChat.unreadCount || 0,
        };

        if (!chatListeners.has(chat.refid)) {
          const messagesRef = collection(db, "chats", chat.refid, "messages");
          const qLastMessage = query(messagesRef, orderBy("timestamp", "desc"), limit(1));

          const unsubscribeMessages = onSnapshot(messagesRef, (snapshot) => {
            const unreadCount = snapshot.docs.filter(
              (doc) => !doc.data().readBy?.includes(uid) && doc.data().sender !== uid
            ).length;
            chatData.unreadCount = unreadCount;

            const lastMessageDoc = snapshot.docs
              .sort((a, b) => b.data().timestamp.toDate() - a.data().timestamp.toDate())[0];
            chatData.lastMessage = lastMessageDoc
              ? {
                  text: lastMessageDoc.data().text,
                  timestamp: lastMessageDoc.data().timestamp.toDate(),
                }
              : null;

            updateChatList(currentChatList.map((c) =>
              c.refid === chat.refid ? { ...chatData } : c
            ));
          });

          chatListeners.set(chat.refid, unsubscribeMessages);
        }

        return chatData;
      });

      updateChatList(enrichedChatList);
    } else {
      chatListeners.forEach((unsubscribe) => unsubscribe());
      chatListeners.clear();
      updateChatList([]);
    }
  });

  return () => {
    if (unsubscribeUser) unsubscribeUser();
    chatListeners.forEach((unsubscribe) => unsubscribe());
    chatListeners.clear();
  };
};

const useChatList = () => {
  const user = useAtomValue(globalState);

  const { data: chatList = [], error, isLoading, mutate } = useSWR(
    user?.uid ? `chatList-${user.uid}` : null,
    () => fetchChatList(user.uid, mutate),
    {
      revalidateOnFocus: false,
      dedupingInterval: 100,
      refreshInterval: 0,
    }
  );

  const deleteChat = async (chatRefId) => {
    if (!user?.uid) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        chatlist: chatList.filter((chat) => chat.refid !== chatRefId),
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return { chatList, isLoading, deleteChat, mutate };
};

export default useChatList;