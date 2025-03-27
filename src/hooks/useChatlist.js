import useSWR from "swr";
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const fetchChatList = (uid) => {
  return new Promise((resolve, reject) => {
    if (!uid) {
      reject("No user ID");
      return;
    }

    const userDocRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          resolve(docSnap.data().chatlist || []);
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

      mutate(); // Refresh chat list
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return { chatList, isLoading, deleteChat };
};

export default useChatList;
