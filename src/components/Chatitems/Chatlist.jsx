import React, { useState, forwardRef, useImperativeHandle, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  Search, X } from "lucide-react";
import useChatList from "../../hooks/useChatlist";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EmptyStateSkeleton from "./chatlist/EmptyStateSkeleton";
import ChatItem from "./chatlist/Chatitem";
import NoSearchResults from "./chatlist/NoSearchResults";
import { Input } from "@/components/ui/input";



const ChatList = forwardRef(({ setActiveChat, isSearching }, ref) => {
  const { chatList, isLoading, deleteChat } = useChatList();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    setSearchQuery: (query) => setSearchQuery(query),
    clearSearch: () => setSearchQuery(""),
  }));

  const filteredChatList = useMemo(() => {
    if (!searchQuery.trim()) return chatList;
    return chatList.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatList, searchQuery]);

  const confirmDelete = (refid, e) => {
    e.stopPropagation();
    setChatToDelete(refid);
    setOpen(true);
  };

  const handleChatSelect = (refid, name) => {
    setActiveChat(refid, name);
    navigate(`/home/${name}`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {isSearching && (
        <div className="px-3 py-2 border-b dark:border-neutral-800 flex items-center">
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            autoFocus
          />
          <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")}>
            <X className="h-5 w-5 text-neutral-500" />
          </Button>
        </div>
      )}

      <Card className="flex flex-col h-full border-none shadow-none h-[calc(100vh-69px)]">
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChatList.length > 0 ? (
              <div className="divide-y dark:divide-neutral-800">
                {filteredChatList.map(chat => (
                  <ChatItem
                    key={chat.refid}
                    chat={chat}
                    onSelect={handleChatSelect}
                    onDelete={confirmDelete}
                  />
                ))}
              </div>
            ) : searchQuery.trim() !== "" ? (
              <NoSearchResults query={searchQuery} />
            ) : (
              <EmptyStateSkeleton />
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Chat?</DialogTitle>
            <p className="text-sm text-neutral-500">
              This will permanently delete all messages in this chat.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (chatToDelete) deleteChat(chatToDelete);
                setOpen(false);
                navigate("/home");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ChatList;
