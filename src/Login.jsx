import React from "react";
import { useAtomValue } from "jotai";
import { globalState } from "./jotai/globalState";
import { Navigate } from "react-router-dom";
import useLogin from "./hooks/useLogin";

const Login = () => {
  const { handleGoogleSignIn, error, loading } = useLogin();
  const user = useAtomValue(globalState);

  if (user) {
    return <Navigate to="/home" />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-neutral-100 dark:border-neutral-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-2">Kabosu
</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Connect and chat with  everyone</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`flex items-center justify-center w-full py-3 px-4 rounded-lg transition duration-300 ${
              loading 
                ? "bg-neutral-100 dark:bg-neutral-700 cursor-not-allowed" 
                : "bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600 shadow-sm hover:shadow"
            }`}
          >
            {!loading ? (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-neutral-700 dark:text-neutral-200 font-medium">Sign in with Google</span>
              </>
            ) : (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-neutral-500 dark:text-neutral-400">Signing in...</span>
              </div>
            )}
          </button>
        </div>

        <div className="text-center mt-8 text-neutral-500 dark:text-neutral-400 text-sm">
          By signing in, you agree to our 
          <a href="#" className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 ml-1">Terms of Service</a> and 
          <a href="#" className="text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 ml-1">Privacy Policy</a>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-center space-x-2">
            <img src="/dogo.svg" alt="Doggo logo" className="h-10 w-10 rounded-full" />
            <span className="text-neutral-600 dark:text-neutral-300 text-sm">Woof securely with DoggoChat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;