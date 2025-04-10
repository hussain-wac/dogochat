import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlusIcon } from "lucide-react";

const UserAvatar = ({ profilePic, username }) => {
  return profilePic ? (
    <img
      src={profilePic}
      alt={username}
      className="w-12 h-12 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-xl">
      {username.charAt(0).toUpperCase()}
    </div>
  );
};

const UsernameText = ({ username }) => (
  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
    {username}
  </p>
);

const EmailText = ({ email }) => (
  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[180px]">
    {email}
  </p>
);

export const UserItem = ({ user, startChat }) => {
  const handleClick = () => startChat(user);

  return (
    <div
      className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <UserAvatar profilePic={user.photoURL} username={user.username} />
        <div className="flex flex-col overflow-hidden">
          <UsernameText username={user.username} />
          <EmailText email={user.email} />
        </div>
      </div>
    </div>
  );
};
