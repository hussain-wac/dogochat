// src/components/Login.js
import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { LogIn } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { globalState } from "./jotai/globalState";
import { Navigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();
  const setUser = useSetAtom(globalState);
  const user = useAtomValue(globalState);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          username: user.displayName.toLowerCase(),
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          chatlist: [] // initialize chatlist as empty array
        });
        await updateProfile(user, {
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }

      // Store user info in global state
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

  if (user) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome to Chat
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`flex items-center justify-center w-full py-3 px-4 rounded-lg border transition duration-300 ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 border-gray-300"
            }`}
          >
            <LogIn
              size={24}
              className={`mr-2 ${loading ? "text-gray-500" : "text-gray-700"}`}
            />
            <span className="text-gray-700">
              {loading ? "Signing In..." : "Sign in with Google"}
            </span>
          </button>
        </div>

        <div className="text-center mt-4 text-gray-500 text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default Login;
