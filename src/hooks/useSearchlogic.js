import React, { useState } from "react";
import { db } from "../firebase";
import { useSWRConfig } from "swr";
import { chatdetails, globalState } from "../jotai/globalState";
import { useAtomValue, useSetAtom } from "jotai";
import { useSearchUsers } from "../hooks/useSearchUsers";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

const useSearchlogic = ({ setActiveChat }) => {
  const user = useAtomValue(globalState);
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");
  const setdet = useSetAtom(chatdetails);
  const { users, isLoading } = useSearchUsers(search);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
    }
  };
  const startChat = async (selectedUser) => {
    if (!user) return;
    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);

    try {
      await setDoc(
        chatRef,
        {
          chatusername1: user.displayName,
          chatusername2: selectedUser.username,
          messages: [],
        },
        { merge: true }
      );

      const currentUserRef = doc(db, "users", user.uid);
      const selectedUserRef = doc(db, "users", selectedUser.uid);

      await updateDoc(currentUserRef, {
        chatlist: arrayUnion({
          name: selectedUser.username,
          type: "private",
          refid: chatId,
          profilePic: selectedUser.photoURL,
        }),
      });

      await updateDoc(selectedUserRef, {
        chatlist: arrayUnion({
          name: user.displayName,
          type: "private",
          refid: chatId,
        }),
      });

      mutate(`chatList-${user.uid}`);

      setActiveChat(chatId);

      setSearch("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return {
    users,
    isLoading,
    setdet,
    setSearch,
    startChat,
    search,
    handleKeyDown,
  };
};

export default useSearchlogic;
