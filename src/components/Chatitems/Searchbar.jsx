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
    <div className="p-4 border-b dark:border-gray-700">
      <div className="flex space-x-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button variant="outline" disabled>
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="mt-2 flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
        </div>
      )}

      {users.length > 0 && !isLoading && (
        <Command className="mt-2">
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2">
                    <UserPlusIcon className="h-4 w-4 text-gray-500" />
                    <span>{user.username}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      startChat(user);
                    }}
                  >
                    Start Chat
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