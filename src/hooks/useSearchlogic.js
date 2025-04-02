import React, { useState, useRef } from "react";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const setdet = useSetAtom(chatdetails);
  const { users, isLoading } = useSearchUsers(debouncedSearch);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // Simple debounce function
  const debounce = (func, delay) => {
    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Debounced search handler
  const debouncedSearchHandler = debounce((searchValue) => {
    setDebouncedSearch(searchValue);
  }, 300);

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearch(value);
    // Only trigger search if value is empty or >= 3 characters
    if (value.length === 0 || value.length >= 3) {
      debouncedSearchHandler(value);
    } else {
      // Clear debounced search if less than 3 characters
      debouncedSearchHandler("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Immediately trigger search if >= 3 characters
      if (search.length >= 3) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setDebouncedSearch(search);
      }
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
      setDebouncedSearch("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  return {
    users,
    isLoading,
    setdet,
    setSearch: handleSearchChange,
    startChat,
    search,
    handleKeyDown,
  };
};

export default useSearchlogic;