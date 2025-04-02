// SearchBar.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SearchIcon, UserPlusIcon, Loader2 } from "lucide-react";
import useSearchlogic from "../../hooks/useSearchlogic";

function SearchBar({ setActiveChat }) {
  const {
    users,
    isLoading,
    setSearch,
    startChat,
    search,
    handleKeyDown,
  } = useSearchlogic({ setActiveChat });

  return (
    <div className="p-4 border-b dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
      <div className="flex items-center space-x-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-4 py-2 rounded-full border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-neutral-50 dark:bg-neutral-800 shadow-sm"
          />
        </div>
        <Button 
          variant="outline" 
          disabled
          className="rounded-full border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          <SearchIcon className="h-4 w-4 text-neutral-400" />
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg max-w-2xl mx-auto">
          <Loader2 className="animate-spin h-6 w-6 text-orange-500" />
        </div>
      )}

      {users.length > 0 && !isLoading && (
        <Command className="mt-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-md max-w-2xl mx-auto">
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-neutral-500 dark:text-neutral-400">No users found</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    {user.profilePic ? (
                      <img 
                        src={user.profilePic} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {user.username}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startChat(user)}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-3 py-1 text-sm shadow-sm"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </div>
  );
}

export default SearchBar;