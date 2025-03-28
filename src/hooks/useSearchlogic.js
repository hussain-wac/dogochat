import React, { useState } from "react";
import { db } from "../firebase";
import { useSWRConfig } from "swr";
import { chatdetails, globalState } from "../jotai/globalState";
import { useAtomValue, useSetAtom } from "jotai";
import { useSearchUsers } from "../hooks/useSearchUsers";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const useSearchlogic = ({ setActiveChat }) => {
  const user = useAtomValue(globalState);
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");
  const setdet = useSetAtom(chatdetails);
  const { users, isLoading } = useSearchUsers(search);
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Add logic here if needed for Enter key press
    }
  };

  const startChat = async (selectedUser) => {
    if (!user) return;

    const currentUsername = user.displayName.toLowerCase();
    const selectedUsername = selectedUser.username.toLowerCase();

    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);

    try {
      await setDoc(
        chatRef,
        {
          chatusername1: currentUsername,
          chatusername2: selectedUsername,
          messages: [],
        },
        { merge: true }
      );

      const currentUserRef = doc(db, "users", user.uid);
      const selectedUserRef = doc(db, "users", selectedUser.uid);

      await updateDoc(currentUserRef, {
        chatlist: arrayUnion({
          name: selectedUsername,
          type: "private",
          refid: chatId,
          profilePic: selectedUser.photoURL,
        }),
      });

      await updateDoc(selectedUserRef, {
        chatlist: arrayUnion({
          name: currentUsername,
          type: "private",
          refid: chatId,
          profilePic: user.photoURL, 
        }),
      });

      mutate(`chatList-${user.uid}`);

      setActiveChat(chatId, selectedUsername);
      setdet({
        chatname: selectedUsername,
        profilePic: selectedUser.photoURL,
      });

      navigate(`/home/${selectedUsername}`);

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