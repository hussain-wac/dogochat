import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import { UserItem } from "./UserItem";

export const UserList = ({ users, startChat, search }) => {
  if (search.length < 3) return null;
  return (
    <Command className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-lg max-w-2xl mx-auto bg-white dark:bg-neutral-900 animate-in fade-in-0 duration-300">
      <CommandList className="max-h-[320px] overflow-y-auto">
        {users.length === 0 && (
          <CommandEmpty className="py-8 text-center text-neutral-500 dark:text-neutral-400 text-sm">
            No users found
          </CommandEmpty>
        )}
        {users.length > 0 && (
          <CommandGroup>
            {users.map((user) => (
              <UserItem key={user.id} user={user} startChat={startChat} />
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
};