import React from "react";

function TypingIndicator({ typingUsersCount, typingUsersNames }) {
  if (typingUsersCount === 0) return null;

  return (
    <div className="flex justify-start mb-3">
      <div className="p-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {typingUsersCount === 1
            ? `${typingUsersNames} is typing`
            : `${typingUsersNames} are typing`}
        </span>
      </div>
    </div>
  );
}

export default TypingIndicator;