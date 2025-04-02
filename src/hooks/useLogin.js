import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { auth, db, realtimeDb } from "../firebase";
import { useSetAtom } from "jotai";
import { globalState } from "../jotai/globalState";

const useLogin = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  const setUser = useSetAtom(globalState);
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const username = user.displayName.toLowerCase();
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          username: username,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          chatlist: [],
        });
        await updateProfile(user, {
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }

      const presenceRef = ref(realtimeDb, `presence/${username}`);
      await set(presenceRef, {
        online: true,
        lastOnline: null,
      });

      setUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    } catch (error) {
      setError(error.message || "Failed to sign in with Google");
      console.error("Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleSignIn, error, loading };
};

export default useLogin;