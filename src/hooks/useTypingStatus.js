import { useEffect, useState, useCallback } from "react";
import { ref, set, onValue, off, remove } from "firebase/database";
import { realtimeDb } from "../firebase";
import { useAuth } from "./useAuth";

const useTypingStatus = (chatId) => {
  const { user } = useAuth();
  const [usersTyping, setUsersTyping] = useState({});

  const typingRef = ref(realtimeDb, `typingStatus/${chatId}/${user?.uid}`);
  const allTypingRef = ref(realtimeDb, `typingStatus/${chatId}`);

  // Debounce function to optimize database writes
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Update typing status in Firebase
  const updateTypingStatus = useCallback(
    debounce((isTyping) => {
      if (!user || !chatId) return;

      if (isTyping) {
        set(typingRef, {
          isTyping: true,
          userId: user.uid,
          displayName: user.displayName || "Anonymous",
          lastUpdated: Date.now(),
        }).catch(console.error);
      } else {
        remove(typingRef).catch(console.error);
      }
    }, 500), // 500ms debounce
    [user, chatId, typingRef]
  );

  // Detect user typing
  const handleTyping = useCallback(
    (text) => {
      updateTypingStatus(!!text.trim());
    },
    [updateTypingStatus]
  );

  // Listen for other users' typing status
  useEffect(() => {
    if (!chatId || !user) return;

    const handleTypingUpdates = (snapshot) => {
      const data = snapshot.val() || {};
      const currentTime = Date.now();

      const activeUsers = Object.entries(data)
        .filter(
          ([_, status]) =>
            status.isTyping &&
            status.lastUpdated > currentTime - 5000 &&
            status.userId !== user.uid
        )
        .reduce((acc, [_, status]) => {
          acc[status.userId] = status;
          return acc;
        }, {});

      setUsersTyping(activeUsers);
    };

    onValue(allTypingRef, handleTypingUpdates);

    return () => {
      off(allTypingRef, "value", handleTypingUpdates);
      remove(typingRef).catch(console.error);
    };
  }, [chatId, user]);

  return {
    handleTyping,
    typingUsersCount: Object.keys(usersTyping).length,
    typingUsersNames: Object.values(usersTyping)
      .map((u) => u.displayName)
      .join(", "),
  };
};

export default useTypingStatus;
