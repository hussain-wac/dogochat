import React, { useState } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion 
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAtomValue } from "jotai";
import { globalState } from "../../jotai/globalState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { 
  SearchIcon, 
  UserPlusIcon 
} from "lucide-react";

function SearchBar({ setActiveChat }) {
  const user = useAtomValue(globalState);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("username", ">=", search.toLowerCase()),
        where("username", "<=", search.toLowerCase() + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResults(foundUsers.filter(u => u.uid !== user.uid));
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
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
          messages: []
        },
        { merge: true }
      );

      const currentUserRef = doc(db, "users", user.uid);
      const selectedUserRef = doc(db, "users", selectedUser.uid);

      await updateDoc(currentUserRef, {
        chatlist: arrayUnion({ name: selectedUser.username, type: "private", refid: chatId })
      });

      await updateDoc(selectedUserRef, {
        chatlist: arrayUnion({ name: user.displayName, type: "private", refid: chatId })
      });

      // ✅ Set active chat immediately
      setActiveChat(chatId);

      setSearch("");
      setResults([]);
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
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          variant="outline"
          disabled={loading}
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>

      {results.length > 0 && (
        <Command className="mt-2">
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {results.map((user) => (
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
                    onClick={() => startChat(user)}
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
