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
    <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-4 py-6 rounded-lg border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50 dark:bg-gray-800"
          />
        </div>
        <Button 
          variant="outline" 
          disabled
          className="rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <SearchIcon className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Loader2 className="animate-spin h-6 w-6 text-orange-500" />
        </div>
      )}

      {users.length > 0 && !isLoading && (
        <Command className="mt-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-gray-500">No users found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    {user.profilePic ? (
                      <img 
                        src={user.profilePic} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-800 dark:text-gray-200">{user.username}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => startChat(user)}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-1 text-sm font-medium transition-colors duration-200"
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