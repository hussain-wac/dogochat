// hooks/useAuth.js
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAtom } from "jotai";
import { globalState } from "../jotai/globalState";

export const useAuth = () => {
  const [globalUser, setGlobalUser] = useAtom(globalState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Update global state if user exists but global state is empty
        if (!globalUser) {
          setGlobalUser({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });
        }
      } else {
        setGlobalUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [globalUser, setGlobalUser]);

  return { 
    user: globalUser, 
    loading,
    isAuthenticated: !!globalUser
  };
};