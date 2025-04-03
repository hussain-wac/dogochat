
import { useRef, useSyncExternalStore } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "../firebase";

export const useFirebasePresence = (username) => {
  const presenceSnapshotRef = useRef({ isOnline: false, lastSeen: null });

  const subscribe = (callback) => {
    if (!username) return () => {};
    const presenceRef = ref(realtimeDb, `presence/${username.toLowerCase()}`);
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const newData = snapshot.val() || { online: false, lastOnline: null };
      if (
        presenceSnapshotRef.current.isOnline !== newData.online ||
        presenceSnapshotRef.current.lastSeen !== newData.lastOnline
      ) {
        presenceSnapshotRef.current = { isOnline: newData.online, lastSeen: newData.lastOnline };
        callback();
      }
    });
    return () => unsubscribe();
  };

  const getSnapshot = () => presenceSnapshotRef.current;

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
