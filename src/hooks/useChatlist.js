import useSWR from "swr";
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import { doc, onSnapshot } from "firebase/firestore";
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

  const { data: chatList = [], error } = useSWR(
    user?.uid ? `chatList-${user.uid}` : null,
    () => fetchChatList(user.uid),
    {
      revalidateOnFocus: true, 
      dedupingInterval: 10000, 
    }
  );

  if (error) console.error("Error fetching chat list:", error);

  return { chatList, user };
};

export default useChatList;
