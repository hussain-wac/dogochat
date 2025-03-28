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
      // Add any logic here if needed for Enter key press
    }
  };

  const startChat = async (selectedUser) => {
    if (!user) return;

    // Ensure all usernames are lowercase
    const currentUsername = user.displayName.toLowerCase();
    const selectedUsername = selectedUser.username.toLowerCase();

    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);

    try {
      // Store chat data with lowercase usernames
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

      // Update current user's chatlist with lowercase username
      await updateDoc(currentUserRef, {
        chatlist: arrayUnion({
          name: selectedUsername,
          type: "private",
          refid: chatId,
          profilePic: selectedUser.photoURL,
        }),
      });

      // Update selected user's chatlist with lowercase username
      await updateDoc(selectedUserRef, {
        chatlist: arrayUnion({
          name: currentUsername,
          type: "private",
          refid: chatId,
        }),
      });

      mutate(`chatList-${user.uid}`);

      // Pass lowercase username to setActiveChat
      setActiveChat(chatId, selectedUsername);
      setdet({
        chatname: selectedUsername,
        profilePic: selectedUser.photoURL,
      });

      // Navigate with lowercase username
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