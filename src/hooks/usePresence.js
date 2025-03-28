// src/hooks/usePresence.js
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { globalState } from "../jotai/globalState";
import { ref, set, onDisconnect, onValue } from "firebase/database";
import { realtimeDb } from "../firebase";

const usePresence = () => {
  const user = useAtomValue(globalState);

  useEffect(() => {
    if (!user || !user.displayName) {
      console.log("No user available for presence update");
      return;
    }

    const username = user.displayName.toLowerCase();
    const presenceRef = ref(realtimeDb, `presence/${username}`);
    const connectedRef = ref(realtimeDb, ".info/connected");

    // Initial connection check
    const unsubscribeConnected = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        console.log(`User ${username} connected`);
        set(presenceRef, {
          online: true,
          lastOnline: null,
        }).catch((err) => console.error(`Failed to set online: ${err.message}`));

        onDisconnect(presenceRef)
          .set({
            online: false,
            lastOnline: Date.now(),
          })
          .catch((err) => console.error(`Failed to set onDisconnect: ${err.message}`));
      }
    });

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log(`Tab active: Setting ${username} as online`);
        set(presenceRef, {
          online: true,
          lastOnline: null,
        }).catch((err) => console.error(`Failed to set online: ${err.message}`));
      } else {
        console.log(`Tab inactive: Setting ${username} as offline`);
        set(presenceRef, {
          online: false,
          lastOnline: Date.now(),
        }).catch((err) => console.error(`Failed to set offline: ${err.message}`));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      unsubscribeConnected();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log(`Cleaning up presence for ${username}`);
      set(presenceRef, {
        online: false,
        lastOnline: Date.now(),
      }).catch((err) => console.error(`Cleanup failed: ${err.message}`));
    };
  }, [user]);
};

export default usePresence;