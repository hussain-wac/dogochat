// components/NotFound.js
import React from "react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn Button component

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100 dark:from-gray-900 dark:via-orange-950 dark:to-gray-900 p-4">
      <div className="text-center space-y-6 animate-fade-in max-w-2xl w-full">
      <div className="flex flex-col items-center justify-center text-neutral-500 h-full space-y-4 p-8">
        <img
          src="/meme.png"
          alt="Dogochat Logo"
          className="w-60 h-60 filter drop-shadow-md"
        />
        </div>
        {/* Large 404 Display */}
        <h1 className="text-7xl sm:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 dark:from-orange-400 dark:via-orange-500 dark:to-amber-400 tracking-tight">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-100">
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mx-auto">
          It seems we've lost our way. The page you're looking for doesn't exist
          or has been moved.
        </p>

        {/* Back Home Button - Shadcn styled */}
        <Button
          as="a"
          href="/"
          className="mt-4 inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
