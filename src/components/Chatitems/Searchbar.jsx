import React, { useState } from "react";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase";
import { useAtomValue, useSetAtom } from "jotai";
import { chatname, globalState } from "../../jotai/globalState";
import { useSWRConfig } from "swr";
import { useSearchUsers } from "../../hooks/useSearchUsers";
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

function SearchBar({ setActiveChat }) {
  const user = useAtomValue(globalState);
  const { mutate } = useSWRConfig();
  const [search, setSearch] = useState("");

  const { users, isLoading } = useSearchUsers(search);

  const setchatname = useSetAtom(chatname);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
    }
  };

  const startChat = async (selectedUser) => {
    if (!user) return;
    const chatId = [user.uid, selectedUser.uid].sort().join("_");
    const chatRef = doc(db, "chats", chatId);

    try {
      await setDoc(
        chatRef,
        {
          chatusername1: user.displayName,
          chatusername2: selectedUser.username,
          messages: [],
        },
        { merge: true }
      );

      const currentUserRef = doc(db, "users", user.uid);
      const selectedUserRef = doc(db, "users", selectedUser.uid);

      await updateDoc(currentUserRef, {
        chatlist: arrayUnion({
          name: selectedUser.username,
          type: "private",
          refid: chatId,
        }),
      });

      await updateDoc(selectedUserRef, {
        chatlist: arrayUnion({
          name: user.displayName,
          type: "private",
          refid: chatId,
        }),
      });

      mutate(`chatList-${user.uid}`);

      setActiveChat(chatId);

      setSearch("");
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

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
                      startChat(user), setchatname(user.username);
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
