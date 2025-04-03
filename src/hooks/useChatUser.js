import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export const useChatUser = (username) => {
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    if (!username) return;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        setChatUser(querySnapshot.docs[0].data());
      } else {
        setChatUser(null);
      }
    });

    return () => unsubscribe();
  }, [username]);

  return chatUser;
};
